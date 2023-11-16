import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as config from "./config";

// Specify the AWS region
const region = config.awsregion;

// Create a new VPC
const vpc = new aws.ec2.Vpc(config.vpcTags.Name, {
    cidrBlock: config.vpcCidrBlock,
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: config.vpcTags,
});

// Internet Gateway
const igw = new aws.ec2.InternetGateway(config.igwTags.Name, {
    vpcId: vpc.id,
    tags: config.igwTags,
});

// Subnets
const subnet1 = new aws.ec2.Subnet(config.pubsub1.Name, {
    vpcId: vpc.id,
    cidrBlock: config.pubsub1.sub1cidrblock,
    mapPublicIpOnLaunch: true,
    availabilityZone: region + "a", // Choose the first AZ in the region
    tags: { 
        Name: config.pubsub1.Name,
        Env: config.pubsub1.Env
     },
});

const subnet2 = new aws.ec2.Subnet(config.pubsub2.Name, {
    vpcId: vpc.id,
    cidrBlock: config.pubsub2.sub1cidrblock,
    mapPublicIpOnLaunch: true,
    availabilityZone: region + "b", // Choose the second AZ in the region
    tags: { 
        Name: config.pubsub2.Name,
        Env: config.pubsub2.Env
     },
});

const subnet3 = new aws.ec2.Subnet(config.prisub1.Name, {
    vpcId: vpc.id,
    cidrBlock: config.prisub1.sub1cidrblock,
    mapPublicIpOnLaunch: false,
    availabilityZone: region + "a",
    tags: { 
        Name: config.prisub1.Name,
        Env: config.prisub1.Env
    },
});

const subnet4 = new aws.ec2.Subnet(config.prisub2.Name, {
    vpcId: vpc.id,
    cidrBlock: config.prisub2.sub1cidrblock,
    mapPublicIpOnLaunch: false,
    availabilityZone: region + "b",
    tags: { 
        Name: config.prisub2.Name,
        Env: config.prisub2.Env
    },
});

/// Create a new route table for public subnets
const publicRouteTable = new aws.ec2.RouteTable(config.vpcTags.Name +"PubRTable", {
    vpcId: vpc.id,
    tags: {
        Name: config.vpcTags.Name +"PubRTable", // You can customize the name
        Env: config.vpcTags.Env,
    },
});

// Create a route in the public route table to route traffic to the internet gateway
const publicRoute = new aws.ec2.Route(config.vpcTags.Name +"publicRoute", {
    routeTableId: publicRouteTable.id,
    destinationCidrBlock: "0.0.0.0/0",
    gatewayId: igw.id,
});

// Associate the public route table with the public subnets
const publicSubnet1Association = new aws.ec2.RouteTableAssociation("publicSubnet1Association", {
    subnetId: subnet1.id,
    routeTableId: publicRouteTable.id,
});

const publicSubnet2Association = new aws.ec2.RouteTableAssociation("publicSubnet2Association", {
    subnetId: subnet2.id,
    routeTableId: publicRouteTable.id,
});

// NAT Gateway - on AZ 1
//const eip = new aws.ec2.Eip("eip", { vpc: true });

const eip = new aws.ec2.Eip("eip", {
    //instance: /* ... */,
    domain: "vpc", // or "standard" depending on your use case
  });

const natGateway = new aws.ec2.NatGateway(config.natGateway.Name, {
    subnetId: subnet1.id, // Choose one of the public subnets
    allocationId: eip.id,
    tags: { 
        Name: config.natGateway.Name,
        Env: config.natGateway.Env
    },
});

// Create a new route table for private subnets
const privateRouteTable = new aws.ec2.RouteTable(config.vpcTags.Name +"PriRTable", {
    vpcId: vpc.id,
    tags: {
        Name: config.vpcTags.Name +"PriRTable", // You can customize the name
        Env: config.vpcTags.Env,
    },
});

// Create a route in the private route table to route traffic to the NAT gateway
const privateRoute = new aws.ec2.Route(config.vpcTags.Name + "privateRoute", {
    routeTableId: privateRouteTable.id,
    destinationCidrBlock: "0.0.0.0/0", // Routes all traffic to the NAT gateway
    natGatewayId: natGateway.id,
});

// Associate the private route table with the private subnets
const privateSubnet3Association = new aws.ec2.RouteTableAssociation("privateSubnet3Association", {
    subnetId: subnet3.id,
    routeTableId: privateRouteTable.id,
});

const privateSubnet4Association = new aws.ec2.RouteTableAssociation("privateSubnet4Association", {
    subnetId: subnet4.id,
    routeTableId: privateRouteTable.id,
});

// VPC Endpoint for S3
const ep = new aws.ec2.VpcEndpoint("vpc_ep", {
    vpcId: vpc.id,
    serviceName: "com.amazonaws." + region + ".s3",
    vpcEndpointType: "Gateway",
});


// Exports
export const vpcId = vpc.id;
export const publicSubnetIds = pulumi.all([subnet1.id, subnet2.id]).apply(ids => ({ subnet1: ids[0], subnet2: ids[1] }));
export const pubsub1id = subnet1.id;
export const privateSubnetIds = pulumi.all([subnet3.id, subnet4.id]).apply(ids => ({ subnet3: ids[0], subnet4: ids[1] }));
export const natGatewayId = natGateway.id;
export const vpcEndpointId = ep.id;
export const internetGatewayId = igw.id;