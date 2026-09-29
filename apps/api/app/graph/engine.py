import logging
from typing import Dict, Any, List, Set, Optional, Tuple
from collections import deque
import networkx as nx
from neo4j import GraphDatabase, Driver
from app.core.config import settings

logger = logging.getLogger(__name__)


class GraphEngine:
    def __init__(self):
        self.uri = settings.NEO4J_URI
        self.username = settings.NEO4J_USERNAME
        self.password = settings.NEO4J_PASSWORD
        self._driver: Optional[Driver] = None
        self._neo4j_available = False
        self._in_memory_graph = nx.DiGraph()

        self._init_neo4j()

    def _init_neo4j(self):
        try:
            self._driver = GraphDatabase.driver(
                self.uri,
                auth=(self.username, self.password),
                connection_timeout=2.0
            )
            self._driver.verify_connectivity()
            self._neo4j_available = True
            logger.info("Successfully connected to Neo4j Graph Database.")
        except Exception as e:
            logger.warning(
                f"Neo4j connection failed ({self.uri}): {e}. "
                "Operating with high-performance in-memory graph engine (NetworkX)."
            )
            self._neo4j_available = False

    def close(self):
        if self._driver:
            self._driver.close()

    def build_graph_from_transactions(
        self,
        suspect_address: str,
        transactions: List[Dict[str, Any]],
        vasp_address_map: Dict[str, Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Populates graph and returns structured nodes and edges for frontend (Cytoscape.js).
        vasp_address_map maps lower-cased address -> { "vasp_id": ..., "vasp_name": ..., "type": ... }
        """
        nodes_dict: Dict[str, Dict[str, Any]] = {}
        edges_list: List[Dict[str, Any]] = []

        norm_suspect = suspect_address.lower()

        # Initialize suspect node
        nodes_dict[norm_suspect] = {
            "id": norm_suspect,
            "label": f"Suspect: {norm_suspect[:6]}...{norm_suspect[-4:]}",
            "address": suspect_address,
            "entity_type": "suspect_wallet",
            "chain": transactions[0]["blockchain"] if transactions else "ethereum",
            "is_suspect": True,
            "is_vasp": False,
            "vasp_name": None,
            "total_in": 0.0,
            "total_out": 0.0,
            "tx_count": 0,
            "hop_level": 0,
        }

        # Process each transaction
        for tx in transactions:
            from_addr = tx["from_address"]
            to_addr = tx["to_address"]
            norm_from = from_addr.lower()
            norm_to = to_addr.lower()
            amount = float(tx.get("amount", 0.0))
            hop = tx.get("hop_level", 1)
            chain = tx.get("blockchain", "ethereum")

            # Source Node
            if norm_from not in nodes_dict:
                is_vasp = norm_from in vasp_address_map
                vasp_info = vasp_address_map.get(norm_from, {})
                nodes_dict[norm_from] = {
                    "id": norm_from,
                    "label": f"{vasp_info.get('vasp_name', 'Wallet')}: {norm_from[:6]}...{norm_from[-4:]}",
                    "address": from_addr,
                    "entity_type": "vasp_deposit" if is_vasp else "intermediate_wallet",
                    "chain": chain,
                    "is_suspect": (norm_from == norm_suspect),
                    "is_vasp": is_vasp,
                    "vasp_name": vasp_info.get("vasp_name"),
                    "total_in": 0.0,
                    "total_out": amount,
                    "tx_count": 1,
                    "hop_level": max(0, hop - 1),
                }
            else:
                nodes_dict[norm_from]["total_out"] += amount
                nodes_dict[norm_from]["tx_count"] += 1

            # Target Node
            if norm_to not in nodes_dict:
                is_vasp = norm_to in vasp_address_map
                vasp_info = vasp_address_map.get(norm_to, {})
                nodes_dict[norm_to] = {
                    "id": norm_to,
                    "label": f"{vasp_info.get('vasp_name', 'Wallet')}: {norm_to[:6]}...{norm_to[-4:]}" if is_vasp else f"Wallet: {norm_to[:6]}...{norm_to[-4:]}",
                    "address": to_addr,
                    "entity_type": "vasp_deposit" if is_vasp else "intermediate_wallet",
                    "chain": chain,
                    "is_suspect": (norm_to == norm_suspect),
                    "is_vasp": is_vasp,
                    "vasp_name": vasp_info.get("vasp_name"),
                    "total_in": amount,
                    "total_out": 0.0,
                    "tx_count": 1,
                    "hop_level": hop,
                }
            else:
                nodes_dict[norm_to]["total_in"] += amount
                nodes_dict[norm_to]["tx_count"] += 1

            # Edge
            edge_id = f"{tx['tx_hash'][:10]}_{norm_from[:4]}_{norm_to[:4]}"
            edge_type = "deposit" if norm_to in vasp_address_map else tx.get("edge_type", "transfer")
            edges_list.append({
                "id": edge_id,
                "source": norm_from,
                "target": norm_to,
                "tx_hash": tx["tx_hash"],
                "amount": amount,
                "asset": tx.get("asset", "ETH"),
                "timestamp": tx["timestamp"],
                "edge_type": edge_type,
            })

            # Update in-memory graph
            self._in_memory_graph.add_edge(
                norm_from,
                norm_to,
                tx_hash=tx["tx_hash"],
                amount=amount,
                asset=tx.get("asset", "ETH"),
                timestamp=tx["timestamp"],
                edge_type=edge_type
            )

        vasp_nodes_found = sum(1 for n in nodes_dict.values() if n["is_vasp"])
        max_hop_reached = max((n["hop_level"] for n in nodes_dict.values()), default=0)

        return {
            "nodes": list(nodes_dict.values()),
            "edges": edges_list,
            "summary": {
                "total_nodes": len(nodes_dict),
                "total_edges": len(edges_list),
                "max_hop_reached": max_hop_reached,
                "vasp_nodes_found": vasp_nodes_found,
            }
        }

    def trace_nearest_vasp_bfs(
        self,
        suspect_address: str,
        max_hops: int,
        vasp_address_map: Dict[str, Dict[str, Any]],
        min_value: Optional[float] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Bounded BFS Traversal algorithm.
        Finds the shortest valid path from suspect address to a known VASP node.
        Prevents cycles, prunes below minimum_value, stops immediately on first/shortest VASP encounter.
        """
        start = suspect_address.lower()
        queue = deque([(start, [start], [], 0)])  # (current_node, path_nodes, path_edges, hop_count)
        visited: Set[str] = {start}

        while queue:
            curr, path, edge_path, hops = queue.popleft()

            # Check if this node is a known VASP (and not the suspect itself)
            if curr in vasp_address_map and hops > 0:
                vasp_meta = vasp_address_map[curr]
                return {
                    "nearest_vasp_id": vasp_meta.get("vasp_id"),
                    "nearest_vasp_name": vasp_meta.get("vasp_name"),
                    "destination_address": curr,
                    "hop_distance": hops,
                    "direct_deposit": (hops == 1),
                    "path": path,
                    "edge_path": edge_path,
                    "cluster_id": vasp_meta.get("cluster_id"),
                }

            if hops >= max_hops:
                continue

            # Traverse outgoing edges in the graph
            if self._in_memory_graph.has_node(curr):
                out_edges = self._in_memory_graph.out_edges(curr, data=True)
                for u, v, edge_data in out_edges:
                    amount = edge_data.get("amount", 0.0)
                    if min_value is not None and amount < min_value:
                        continue
                    if v not in visited:
                        visited.add(v)
                        queue.append((
                            v,
                            path + [v],
                            edge_path + [edge_data],
                            hops + 1
                        ))

        # Check directly if any VASP address was hit in the transactions
        for addr, meta in vasp_address_map.items():
            if self._in_memory_graph.has_node(addr):
                try:
                    shortest = nx.shortest_path(self._in_memory_graph, source=start, target=addr)
                    hops = len(shortest) - 1
                    if hops <= max_hops:
                        return {
                            "nearest_vasp_id": meta.get("vasp_id"),
                            "nearest_vasp_name": meta.get("vasp_name"),
                            "destination_address": addr,
                            "hop_distance": hops,
                            "direct_deposit": (hops == 1),
                            "path": shortest,
                            "edge_path": [],
                            "cluster_id": meta.get("cluster_id"),
                        }
                except nx.NetworkXNoPath:
                    continue

        return None
