//////////////////////////////////////////////////////////////
import * as varconfig from "./Config";
import * as pulumi from "@pulumi/pulumi";
import * as aws from '@pulumi/aws';
import { pubsub1id } from "./vpc";
import { SecGrup } from "./securityGroup";

// Create EBS volumes
const ebsVolumes = [
    { deviceName: '/dev/sdf', volumeSize: 10, volumeType: 'gp3', tags: { Name: 'data' } },
    // { deviceName: '/dev/sdg', volumeSize: 900, volumeType: 'gp3', tags: { Name: 'cmdf' } },
    // { deviceName: '/dev/sdh', volumeSize: 200, volumeType: 'gp3', tags: { Name: 'omdf' } },
    // { deviceName: '/dev/sdi', volumeSize: 150, volumeType: 'gp3', tags: { Name: 'ldf' } },
    // { deviceName: '/dev/sdj', volumeSize: 100, volumeType: 'gp3', tags: { Name: 'temp' } },
];

const userData = pulumi.interpolate`#!/bin/bash
# Loop through and format/mount EBS volumes
${ebsVolumes.map(volume => `
    # Format the EBS volume
    mkfs -t ext4 ${volume.deviceName}

    # Create a mount point
    mkdir /mnt/${volume.tags.Name}

    # Mount the EBS volume
    mount ${volume.deviceName} /mnt/${volume.tags.Name}

    # Add an entry to /etc/fstab for auto-mounting on instance restart
    echo "${volume.deviceName}  /mnt/${volume.tags.Name} ext4 defaults 0 0" >> /etc/fstab
`).join('\n')}

# Rest of your script...
echo ECS_CLUSTER=default >> /etc/ecs/ecs.config
sudo yum update -y
sudo yum install docker -y
sudo systemctl enable docker
sudo systemctl start docker
sudo chkconfig docker on
sudo usermod -aG docker ec2-user
sudo docker pull zabbix/zabbix-web-nginx-mysql
# Run Docker container with volume mappings
sudo docker run --name mysql-server -t -e MYSQL_DATABASE="zabbix" -e MYSQL_USER="zabbix" -e "MYSQL_PASSWORD=${varconfig.sqlsvrPassword}" \
 -e "MYSQL_ROOT_PASSWORD=${varconfig.sqlsvrPassword}" -d mysql --character-set-server=utf8 --collation-server=utf8_bin \
 --default-authentication-plugin=mysql_native_password
sudo docker run --name zabbix-java-gateway -t --restart unless-stopped -d zabbix/zabbix-java-gateway
sudo docker run --name zabbix-server-mysql -t -e DB_SERVER_HOST="mysql-server" -e MYSQL_DATABASE="zabbix" -e MYSQL_USER="zabbix" \
 -e "MYSQL_PASSWORD=${varconfig.sqlsvrPassword}" -e "MYSQL_ROOT_PASSWORD=${varconfig.sqlsvrPassword}" -e ZBX_JAVAGATEWAY="zabbix-java-gateway" \
 --link mysql-server:mysql --link zabbix-java-gateway:zabbix-java-gateway -p 10051:10051 --restart unless-stopped -d zabbix/zabbix-server-mysql
sudo docker run --name zabbix-web-nginx-mysql -t -e DB_SERVER_HOST="mysql-server" -e MYSQL_DATABASE="zabbix" -e MYSQL_USER="zabbix" -e "MYSQL_PASSWORD=${varconfig.sqlsvrPassword}" \
 -e "MYSQL_ROOT_PASSWORD=${varconfig.sqlsvrPassword}" --link mysql-server:mysql --link zabbix-server-mysql:zabbix-server \
 -p 80:8080 --restart unless-stopped -d zabbix/zabbix-web-nginx-mysql
sudo docker run --name zabbix-agent --link mysql-server:mysql --link zabbix-server-mysql:zabbix-server -e ZBX_HOSTNAME="Zabbix server" -e ZBX_SERVER_HOST="zabbix-server" -d zabbix/zabbix-agent
`;

const instance = new aws.ec2.Instance(varconfig.amzec2keyval.name, {
    ami: varconfig.amzec2keyval.amiid,  // Amazon Linux 2 AMI
    instanceType: varconfig.amzec2keyval.instancetype,  // Choose an appropriate instance type
    subnetId: pubsub1id,
    securityGroups: [SecGrup],
    keyName: varconfig.amzec2keyval.keypairname,  // Replace with your SSH key name
    associatePublicIpAddress: true,
    rootBlockDevice: {
        volumeSize: 10, // Adjust the size of the root volume as needed
        volumeType: 'gp3', // Adjust the volume type as needed
    },
    ebsBlockDevices: ebsVolumes.map(volume => ({
        deviceName: volume.deviceName,
        volumeSize: volume.volumeSize,
        volumeType: volume.volumeType,
    })),
    // privateIp:varconfig.amzec2keyval.privateip,
    tags: {
        Name: varconfig.amzec2keyval.name,
    },
    userData: userData,
});

export const publicIp = instance.publicIp;
export const privateIp = instance.privateIp;
export const publicHostName = instance.publicDns;
