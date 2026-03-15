from __future__ import annotations

from typing import Any

import networkx as nx

from data.dummy_data import SUPPLIERS, SUPPLY_CHAIN_LINKS


def analyze_graph(prompt: str, supplier_rows: list[dict[str, Any]]) -> dict[str, Any]:
    prompt_l = prompt.lower()
    graph = nx.DiGraph()

    allowed_ids = {row.get("supplier_id") or row.get("id") for row in supplier_rows}
    fallback_supplier_rows = [
        {
            "supplier_id": supplier["id"],
            "supplier_name": supplier["name"],
            "risk_score": supplier["riskScore"],
            "country": supplier["country"],
            "industry": supplier["industry"],
        }
        for supplier in SUPPLIERS
    ]

    rows = supplier_rows or fallback_supplier_rows
    if not allowed_ids:
        allowed_ids = {row["supplier_id"] for row in rows}

    for row in rows:
        node_id = row.get("supplier_id") or row.get("id")
        graph.add_node(
            node_id,
            name=row.get("supplier_name") or row.get("name"),
            risk_score=row.get("risk_score") or row.get("riskScore") or 0,
            country=row.get("country"),
            industry=row.get("industry"),
        )

    for edge in SUPPLY_CHAIN_LINKS:
        source = edge["source"]
        target = edge["target"]
        if source in allowed_ids and target in allowed_ids:
            graph.add_edge(source, target, strength=edge.get("strength", 0.5))

    if graph.number_of_nodes() == 0:
        return {"summary": "No graph data available.", "insights": [], "risk_level": "LOW", "supporting_data": {}}

    degree_centrality = nx.degree_centrality(graph)
    betweenness = nx.betweenness_centrality(graph)

    top_degree = sorted(degree_centrality.items(), key=lambda item: item[1], reverse=True)[:5]
    top_between = sorted(betweenness.items(), key=lambda item: item[1], reverse=True)[:5]

    critical_node_id = top_between[0][0] if top_between else top_degree[0][0]
    critical_name = graph.nodes[critical_node_id].get("name", critical_node_id)

    if "single point" in prompt_l or "spof" in prompt_l or "critical" in prompt_l:
        summary = f"Most critical node is {critical_name} based on graph centrality and dependency pathways."
    else:
        summary = "Dependency graph analyzed using centrality metrics."

    insights = [
        f"Graph nodes: {graph.number_of_nodes()}, edges: {graph.number_of_edges()}",
        f"Top critical node: {critical_name}",
        "Betweenness centrality highlights chokepoint suppliers in dependency chains.",
    ]

    supporting_data = {
        "top_degree_nodes": [
            {"supplier_id": node_id, "score": round(score, 4), "name": graph.nodes[node_id].get("name")}
            for node_id, score in top_degree
        ],
        "top_betweenness_nodes": [
            {"supplier_id": node_id, "score": round(score, 4), "name": graph.nodes[node_id].get("name")}
            for node_id, score in top_between
        ],
    }

    return {
        "summary": summary,
        "insights": insights,
        "risk_level": "HIGH" if top_between and top_between[0][1] >= 0.2 else "MEDIUM",
        "supporting_data": supporting_data,
        "recommendations": [
            f"Create contingency plan for {critical_name}",
            "Reduce concentration risk by onboarding alternate paths/suppliers",
            "Run monthly dependency-centrality monitoring",
        ],
    }
