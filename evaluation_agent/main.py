import traceback
from typing import Optional

import uvicorn
from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

app = FastAPI()

# for javascript to call the endpoints
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ApproveParam(BaseModel):
    poolAddress: str
    borrowerWalletAddress: str

class ManualApproveParam(BaseModel):
    poolAddress: str
    borrowerWalletAddress: str
    creditLimit: float

# health check endpoint
@app.get("/health")
async def get_health():
    return {"ok"}


from eaverse import manual_approve_handler
@app.post("/approve")
async def post_approval(request: Request, approve_param: ManualApproveParam):
    """
    router for evaluation agent
    """
    try:
        result = manual_approve_handler(**approve_param.dict())
        json_compatible_result = jsonable_encoder(result)
        return JSONResponse(content=json_compatible_result)
    except Exception as e:
        return JSONResponse(
            content={
                "statusCode": 500,
                "errorMessage": traceback.format_exception_only(type(e), e),
            }
        )
    

from eaverse import evaluation_agent_handler
@app.post("/underwrite")
async def post_approval(request: Request, approve_param: ApproveParam):
    """
    router for evaluation agent
    """
    try:
        result = evaluation_agent_handler(**approve_param.dict())
        json_compatible_result = jsonable_encoder(result)
        return JSONResponse(content=json_compatible_result)
    except Exception as e:
        return JSONResponse(
            content={
                "statusCode": 500,
                "errorMessage": traceback.format_exception_only(type(e), e),
            }
        )

if __name__ == "__main__":
    uvicorn.run("main:app", reload=True, proxy_headers=True)
