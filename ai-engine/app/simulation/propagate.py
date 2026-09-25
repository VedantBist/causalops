import networkx as nx
def simulate(topology, services, target, reduction):
    graph=nx.DiGraph(); [graph.add_edge(e["target"],e["source"]) for e in topology["edges"]] # downstream impact travels reverse call edge
    index={s["name"]:s for s in services}; results=[]
    for name,s in index.items():
        base=float(s["latencyP99"]); distance=nx.shortest_path_length(graph,target,name) if name in graph and target in graph and nx.has_path(graph,target,name) else 99
        changed=base*(1-(reduction/100)*(.62**distance)) if distance<99 else base
        results.append({"service":name,"baseline":round(base,2),"counterfactual":round(changed,2),"classification":"SIMULATED","label":"MODEL-ESTIMATED"})
    return {"methodology":"dependency attenuation heuristic; not validated causal inference","results":results}
