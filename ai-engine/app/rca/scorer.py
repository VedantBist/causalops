"""Transparent, replaceable graph RCA scorer; no causal claims beyond observed signals."""
from collections import defaultdict
import networkx as nx

WEIGHTS={"anomaly":.30,"temporalPrecedence":.25,"dependency":.20,"propagationConsistency":.15,"metricCorrelation":.10}
def score(topology, telemetry):
    graph=nx.DiGraph(); [graph.add_edge(e["source"],e["target"]) for e in topology["edges"]]
    by=defaultdict(list)
    for row in telemetry: by[row["service"]].append(row)
    candidates=[]; evidence=[]
    for service, rows in by.items():
        latest=rows[-1]; anomaly=float(latest.get("anomaly") or 0)
        # Earlier anomaly is a cause candidate: inverse rank in first anomalous timestamp.
        first=next((i for i,r in enumerate(rows) if float(r.get("anomaly") or 0)>.2), len(rows))
        precedence=max(0,1-first/max(1,len(rows)))
        descendants=list(nx.descendants(graph,service)); affected=sum(1 for x in descendants if by[x] and float(by[x][-1].get("anomaly") or 0)>.2)
        dependency=affected/max(1,len(descendants))
        propagation=dependency if descendants else anomaly
        correlation=min(1, (float(latest.get("latency") or 0)/max(1, 20) + float(latest.get("errorRate") or 0)/100)/2)
        signals={"anomaly":round(anomaly,4),"temporalPrecedence":round(precedence,4),"dependency":round(dependency,4),"propagationConsistency":round(propagation,4),"metricCorrelation":round(correlation,4)}
        value=sum(WEIGHTS[k]*v for k,v in signals.items())
        candidates.append({"service":service,"score":round(value,4),"confidence":round(min(.99,value+.12),4),"signals":signals})
        if anomaly>.2: evidence.append({"timestamp":latest.get("timestamp"),"source":"telemetry","service":service,"metric":"p99_latency","observedValue":latest.get("latency"),"baseline":None,"relationship":"observed anomaly", "classification":"OBSERVED"})
    candidates.sort(key=lambda x:x["score"],reverse=True)
    return {"methodology":"weighted anomaly/temporal/dependency graph scorer", "weights":WEIGHTS,"candidates":candidates,"evidence":evidence}
