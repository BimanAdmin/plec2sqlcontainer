import * as varconfig from "./Config";
import * as vpcpubsg from "./vpc";
import * as aws from '@pulumi/aws';

// Define your security group with inbound rules for ports 1433 and 22 and egress rule to allow all outbound traffic
const SecurityGroup = new aws.ec2.SecurityGroup(vpcpubsg.publicSubnetIds.subnet1.get.name, {
    vpcId: vpcpubsg.vpcId,
    description: varconfig.securitygroup.description,
    ingress: [
        { protocol: 'tcp', fromPort: 80, toPort: 80, cidrBlocks: ['0.0.0.0/0'] },
        { protocol: 'tcp', fromPort: 8080, toPort: 8080, cidrBlocks: ['0.0.0.0/0'] },
        { protocol: 'tcp', fromPort: 10051, toPort: 10051, cidrBlocks: ['0.0.0.0/0'] }, // Inbound rule for port 1433
        { protocol: 'tcp', fromPort: 22, toPort: 22, cidrBlocks: ['0.0.0.0/0'] },     // Inbound rule for port 22
        { protocol: 'tcp', fromPort: 443, toPort: 443, cidrBlocks: ['0.0.0.0/0'] },
    ],
    egress: [ // Egress rule to allow all outbound traffic
        { protocol: '-1', fromPort: 0, toPort: 0, cidrBlocks: ['0.0.0.0/0'] },
    ],
    tags: {
        Name: varconfig.securitygroup.description,
    },
    name: varconfig.securitygroup.name,
});

const nodeGroupOne = new aws.ec2.SecurityGroup(varconfig.eksvarconfigval.nodeGroupOnename, {
    namePrefix: varconfig.eksvarconfigval.nodeGroupOnename,
    description: varconfig.securitygroup.name + "Security group for EKS service",
    vpcId: vpcpubsg.vpcId,
    ingress: [
        { protocol: 'tcp', fromPort: 27017, toPort: 27017, cidrBlocks: ['0.0.0.0/0'] },
        { protocol: 'tcp', fromPort: 8080, toPort: 8080, cidrBlocks: ['0.0.0.0/0'] },
        { protocol: 'tcp', fromPort: 10051, toPort: 10051, cidrBlocks: ['0.0.0.0/0'] }, // Inbound rule for port 1433
        { protocol: 'tcp', fromPort: 22, toPort: 22, cidrBlocks: ['0.0.0.0/0'] },     // Inbound rule for port 22
    ],
    egress: [ // Egress rule to allow all outbound traffic
        { protocol: '-1', fromPort: 0, toPort: 0, cidrBlocks: ['0.0.0.0/0'] },
    ],
});

// const nlbSecurityGroup = new aws.ec2.SecurityGroup(varconfig.mongons.nlbname, {
//     name:varconfig.mongons.nlbname,
//     vpcId: vpcpubsg.vpcId, // Use your VPC ID
//     egress: [{
//         protocol: '-1',
//         fromPort: 0,
//         toPort: 0,
//         cidrBlocks: ["0.0.0.0/0"], // Allow all outbound traffic
//     }],
//     // Define ingress rules for your NLB, e.g., port 80 for HTTP:
//     ingress: [{
//         protocol: "tcp",
//         fromPort: 80,
//         toPort: 80,
//         cidrBlocks: ["0.0.0.0/0"],
//     }],
// });


export const nodegrpone = nodeGroupOne.id;
export const SecGrup = SecurityGroup.id;
//export const nlbSecgrup = nlbSecurityGroup.id;
