from aws_cdk import (
    Stack, Duration, RemovalPolicy, CfnOutput,
    aws_s3 as s3,
    aws_lambda as _lambda,
    aws_apigatewayv2 as apigw,
    aws_apigatewayv2_integrations as integrations,
    aws_apigatewayv2_authorizers as authorizers,
    aws_cognito as cognito,
)
from constructs import Construct


class MorphixStack(Stack):

    def __init__(self, scope: Construct, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)

        # ─── S3 Bucket ───────────────────────────────────────────────
        bucket = s3.Bucket(
            self, "MorphixBucket",
            bucket_name=f"morphix-files-{self.account}",
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            encryption=s3.BucketEncryption.S3_MANAGED,
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True,
            cors=[s3.CorsRule(
                allowed_methods=[
                    s3.HttpMethods.GET,
                    s3.HttpMethods.PUT,
                    s3.HttpMethods.POST,
                ],
                allowed_origins=["*"],
                allowed_headers=["*"],
            )],
            lifecycle_rules=[s3.LifecycleRule(
                id="AutoDeleteAfter24Hours",
                expiration=Duration.days(1),
                enabled=True,
            )]
        )

        # ─── Cognito User Pool ───────────────────────────────────────
        user_pool = cognito.UserPool(
            self, "MorphixUserPool",
            user_pool_name="morphix-users",
            self_sign_up_enabled=True,
            sign_in_aliases=cognito.SignInAliases(email=True),
            auto_verify=cognito.AutoVerifiedAttrs(email=True),
            password_policy=cognito.PasswordPolicy(
                min_length=8,
                require_lowercase=True,
                require_uppercase=True,
                require_digits=True,
                require_symbols=False,
            ),
            removal_policy=RemovalPolicy.DESTROY,
        )

        user_pool_client = cognito.UserPoolClient(
            self, "MorphixUserPoolClient",
            user_pool=user_pool,
            user_pool_client_name="morphix-web-client",
            auth_flows=cognito.AuthFlow(
                user_password=True,
                user_srp=True,
            ),
        )

        # ─── Lambda: Presign ─────────────────────────────────────────
        presign_fn = _lambda.Function(
            self, "PresignFunction",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="handler.lambda_handler",
            code=_lambda.Code.from_asset("backend/presign"),
            timeout=Duration.seconds(30),
            memory_size=256,
            environment={
                "BUCKET_NAME": bucket.bucket_name,
                "REGION": self.region,
            }
        )
        bucket.grant_put(presign_fn)
        bucket.grant_read(presign_fn)

        # ─── Pillow Layer ─────────────────────────────────────────────
        pillow_layer = _lambda.LayerVersion(
            self, "PillowLayer",
            code=_lambda.Code.from_asset("backend/layers/pillow"),
            compatible_runtimes=[_lambda.Runtime.PYTHON_3_11],
            description="Pillow image processing library for Morphix",
        )

        # ─── Lambda: Convert ─────────────────────────────────────────
        convert_fn = _lambda.Function(
            self, "ConvertFunction",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="handler.lambda_handler",
            code=_lambda.Code.from_asset("backend/convert"),
            timeout=Duration.seconds(60),
            memory_size=512,
            layers=[pillow_layer],
            environment={
                "BUCKET_NAME": bucket.bucket_name,
                "REGION": self.region,
            }
        )

        # ─── API Gateway ─────────────────────────────────────────────
        authorizer = authorizers.HttpUserPoolAuthorizer(
            "MorphixAuthorizer",
            user_pool,
            user_pool_clients=[user_pool_client],
        )

        api = apigw.HttpApi(
            self, "MorphixApi",
            api_name="morphix-api",
            cors_preflight=apigw.CorsPreflightOptions(
                allow_headers=["Authorization", "Content-Type"],
                allow_methods=[apigw.CorsHttpMethod.ANY],
                allow_origins=["*"],
            )
        )

        api.add_routes(
            path="/presign",
            methods=[apigw.HttpMethod.POST],
            integration=integrations.HttpLambdaIntegration(
                "PresignIntegration", presign_fn
            ),
            authorizer=authorizer,
        )

        api.add_routes(
            path="/convert",
            methods=[apigw.HttpMethod.POST],
            integration=integrations.HttpLambdaIntegration(
                "ConvertIntegration", convert_fn
            ),
            authorizer=authorizer,
        )

        # ─── Outputs ─────────────────────────────────────────────────
        CfnOutput(self, "ApiUrl",
            value=api.url,
            description="Morphix API Gateway URL")

        CfnOutput(self, "BucketName",
            value=bucket.bucket_name,
            description="Morphix S3 Bucket")

        CfnOutput(self, "UserPoolId",
            value=user_pool.user_pool_id,
            description="Cognito User Pool ID")

        CfnOutput(self, "UserPoolClientId",
            value=user_pool_client.user_pool_client_id,
            description="Cognito Client ID")