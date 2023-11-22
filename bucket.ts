import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";


export const mybucket = new aws.s3.Bucket("knowcross-007-test-bucket", {
    acl: "private", // Set the access control list for the bucket (options: private, public-read, public-read-write, authenticated-read, log-delivery-write, bucket-owner-read, bucket-owner-full-control)
});

