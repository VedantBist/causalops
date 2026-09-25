def predict(services):
    result=[]
    for s in services:
        ratio=float(s["latencyP99"])/max(1,float(s["baselineLatency"])); error=float(s.get("errorRate",0))/100
        probability=min(.98,max(.02,.12+.55*max(0,ratio-1)/4+.33*error))
        level="CRITICAL" if probability>.8 else "HIGH" if probability>.55 else "ELEVATED" if probability>.3 else "LOW"
        result.append({"service":s["name"],"probability":round(probability,3),"riskLevel":level,"horizonSeconds":240,"factors":[{"name":"latency_ratio","value":round(ratio,2)},{"name":"error_rate","value":round(error,3)}]})
    return sorted(result,key=lambda x:x["probability"],reverse=True)
