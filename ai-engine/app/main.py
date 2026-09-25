from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any
from .rca.scorer import score
from .prediction.baseline import predict
from .simulation.propagate import simulate
app=FastAPI(title="CausalOps Explainable AI Engine",version="1.0.0")
class Analysis(BaseModel): topology:dict; telemetry:list[dict]
class Prediction(BaseModel): topology:dict; services:list[dict]
class Simulation(BaseModel): topology:dict; services:list[dict]; target:str; reductionPercent:float=70
@app.get('/health')
def health(): return {'status':'UP'}
@app.get('/models/status')
def models(): return {'rca':'weighted graph scorer','prediction':'rolling heuristic','simulation':'dependency attenuation','gpuRequired':False}
@app.post('/analyze/root-cause')
def rca(body:Analysis): return score(body.topology,body.telemetry)
@app.post('/predict/failure')
def failure(body:Prediction): return predict(body.services)
@app.post('/simulate/counterfactual')
def counterfactual(body:Simulation): return simulate(body.topology,body.services,body.target,body.reductionPercent)
