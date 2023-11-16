import * as machineec2 from "./amzec2cnt"
import * as vpc from "./vpc";

export const publicIp = machineec2.publicIp;
export const privateIp = machineec2.privateIp;
export const publicHostName = machineec2.publicHostName

export const vpcId = vpc.vpcId;
export const publicSubnetIds = vpc.publicSubnetIds;
export const privateSubnetIds = vpc.privateSubnetIds;