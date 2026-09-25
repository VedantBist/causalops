from app.rca.scorer import score
from app.simulation.propagate import simulate
def test_database_anomaly_is_ranked():
 t={'edges':[{'source':'inventory-service','target':'inventory-db'},{'source':'order-service','target':'inventory-service'}]}
 rows=[{'service':'inventory-db','latency':1200,'anomaly':1,'timestamp':'1'},{'service':'inventory-service','latency':500,'anomaly':.5,'timestamp':'2'},{'service':'order-service','latency':300,'anomaly':.3,'timestamp':'3'}]
 assert score(t,rows)['candidates'][0]['service']=='inventory-db'
