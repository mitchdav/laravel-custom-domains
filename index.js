const {
          EC2Client,
          DescribeSecurityGroupRulesCommand,
          RevokeSecurityGroupIngressCommand,
      } = require('@aws-sdk/client-ec2');

const {
          GlobalAcceleratorClient,
          RemoveEndpointsCommand,
          DescribeEndpointGroupCommand,
      } = require('@aws-sdk/client-global-accelerator');

const globalaccelerator = new GlobalAcceleratorClient({region: 'us-west-2'});
const ec2 = new EC2Client({region: process.env.Region});

const dumpResponse = function (name, response) {
    console.log(
        'Response from ' + name + ': ',
        JSON.stringify(
            response,
            null,
            2,
        ),
    );
};

exports.handler = async function (event) {
    console.log('Invoked with event: ', JSON.stringify(event));

    const message = JSON.parse(event.Records[0].Sns.Message);
    const eventType = message.Event;
    const ec2InstanceId = message.EC2InstanceId;
    const endpointGroup = process.env.EndpointGroup;

    console.log('Interpreted event type: ', eventType);
    console.log('Interpreted event message: ', JSON.stringify(message, null, 2));

    if (eventType !== 'autoscaling:EC2_INSTANCE_TERMINATE') {
        console.log('Unhandled event type: ', eventType);

        return null;
    }

    const responseFromRemovingEndpoint = await globalaccelerator
        .send(
            new RemoveEndpointsCommand(
                {
                    EndpointGroupArn:    endpointGroup,
                    EndpointIdentifiers: [
                        {
                            ClientIPPreservationEnabled: true,
                            EndpointId:                  ec2InstanceId,
                        },
                    ],
                },
            ),
        );

    dumpResponse('removing endpoint', responseFromRemovingEndpoint);

    const responseFromDescribingEndpointGroup = await globalaccelerator
        .send(
            new DescribeEndpointGroupCommand(
                {
                    EndpointGroupArn: endpointGroup,
                },
            ),
        );

    dumpResponse('describing endpoint group', responseFromDescribingEndpointGroup);

    if (responseFromDescribingEndpointGroup.EndpointGroup.EndpointDescriptions.length > 0) {
        return null;
    }

    const responseFromDescribingSecurityGroupRules = await ec2
        .send(
            new DescribeSecurityGroupRulesCommand(
                {
                    Filters: [
                        {
                            Name:   'group-id',
                            Values: [
                                process.env.SecurityGroupId,
                            ],
                        },
                    ],
                },
            ),
        );

    dumpResponse('describing security group rules', responseFromDescribingSecurityGroupRules);

    if (responseFromDescribingSecurityGroupRules.SecurityGroupRules.length === 0) {
        return null;
    }

    const globalAcceleratorIngressRuleIds = responseFromDescribingSecurityGroupRules
        .SecurityGroupRules
        .filter((rule) => {
            return rule.FromPort === 80 || rule.FromPort === 443;
        })
        .map((rule) => {
            return rule.SecurityGroupRuleId;
        });

    if (globalAcceleratorIngressRuleIds.length === 0) {
        return null;
    }

    console.log(
        'Determined that the endpoint group no longer has any endpoints and that there are security group rules allowing GlobalAccelerator access via HTTP and HTTPS, so deleting those security group rules now.',
    );

    const responseFromRevokingSecurityGroupIngressRules = await ec2
        .send(
            new RevokeSecurityGroupIngressCommand(
                {
                    GroupId:              process.env.SecurityGroupId,
                    SecurityGroupRuleIds: globalAcceleratorIngressRuleIds,
                },
            ),
        );

    dumpResponse('revoking security group ingress rules', responseFromRevokingSecurityGroupIngressRules);

    return null;
};
