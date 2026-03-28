import aws_cdk as cdk
from infrastructure.stack import MorphixStack

app = cdk.App()

MorphixStack(
    app,
    "MorphixStack",
    env=cdk.Environment(region="us-east-1")
)

app.synth()
