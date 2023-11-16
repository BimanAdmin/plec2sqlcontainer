//AWS Region
export const awsregion = "us-west-2";

//AWS AccountID
//export const awsaccountid = "193088938549";

//VPC CIDR
export const vpcCidrBlock = "173.0.0.0/16";

//VPCTags
export const vpcTags = {
    Name: "my-vpc-02",
    Env: "sandbox-biman",
};

export const igwTags = {
    Name: vpcTags.Name +"-igw",
    Env: "sandbox-biman"
}

export const pubsub1 = {
    sub1cidrblock: "173.0.1.0/24",
    Name: vpcTags.Name +"-PublicSub-1",
    Env: vpcTags.Env
}

export const pubsub2 = {
    sub1cidrblock: "173.0.2.0/24",
    Name: vpcTags.Name +"-PublicSub-2",
    Env: vpcTags.Env
}

export const prisub1 = {
    sub1cidrblock: "173.0.3.0/24",
    Name: vpcTags.Name +"-PrivateSub-1",
    Env: vpcTags.Env
}

export const prisub2 = {
    sub1cidrblock: "173.0.4.0/24",
    Name: vpcTags.Name +"-PrivateSub-2",
    Env: vpcTags.Env
}

export const natGateway = {
    Name: vpcTags.Name +"-ngw",
    Env: vpcTags.Env
}

//Security SG
export const securitygroup = {
    description: "EC2 security group ",
    name: vpcTags.Name +" SG"
}

//sqlserver password
export const sqlsvrPassword = "W#RY7YJSkT9nwsF&19tSWS";


//EC2 Variablles values 

export const amzec2keyval = {
    keypairname: "KC-UAT-US-OHIO",
    instancetype: "t3a.medium",
    garminstancetype: "t4g.small",
    name: "sb-zbx-container",
    garmname: "sb-zbx-gec2",
    privateip: "172.20.3.114",
    garmamid: "ami-0e83be366243f524a", //Canonical, Ubuntu, 22.04 LTS, arm64 jammy image build on 2023-05-16
    amiid: "ami-06d4b7182ac3480fa"//Amazon Linux 2023 AMI 2023.1.20230912.0 x86_64 HVM kernel-6.1
}

// Define your EKS local variables
export const eksvarconfigval = {
    clsname: vpcTags.Name +"-ekscls",
    nodeGroupOnename: "eksnodegpone",
    ec2amitype:"AL2_X86_64",
    fixnggrpinstype: "t3a.medium",
    fixnggrpinstype2: "t3.medium",
    spotnggrpinstype: "t3a.medium",
    eksclsversion: "1.27",
}