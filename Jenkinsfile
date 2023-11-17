//Jenkins Pipeline

pipeline {
    agent any

    environment {
        AWS_REGION = 'us-west-2'
        AWS_ACCESS_KEY_ID = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
        PULUMI_ACCESS_TOKEN = credentials('pulumi-access-token')
        PULUMI_STACK = 'plec2sqlcontainer'
        GITHUB_REPO_URL = 'https://github.com/BimanAdmin/plec2sqlcontainer.git'
        //CLUSTER_NAME = 'my-vpc-01-ekscls'
        //PULUMI_PROJECT_PATH = 'Pulumi-eks'
        PULUMI_STATE_BUCKET = 's3://my-bucket-2688e2a/pulumi-state/'  // Set your Pulumi state bucket URL
        PATH = "/var/lib/jenkins/.pulumi/bin:$PATH" // Installation Path for Pulumi on Jenkins ec2 machine
        npm_PATH= " /usr/share/npm:$npm_PATH"
        //KUBECONFIG_FILE = 'kubeconfig.yaml'

    }

    tools {
         nodejs 'pulumi'

    }

    stages {

        stage('Fetch Code') {
            steps {
                echo 'Fetching code from GitHub'
                git branch: 'main', url: "${GITHUB_REPO_URL}"
            }
        }

        stage ("Install dependencies") {
            steps {
                sh "curl -fsSL https://get.pulumi.com | sh"
                sh "export PATH=$PATH:/var/lib/jenkins/.pulumi/bin"

             }
        }


        stage('Check or Initialize Pulumi Stack') {
            steps {
                script {
                    // Check if the stack exists
                    def stackExists = fileExists(".pulumi/stacks/${PULUMI_STACK}.json")
                        if (stackExists) {
                            sh "pulumi stack init ${PULUMI_STACK}"
                        }
                        else if (!stackExists) {
                            sh "pulumi stack select ${PULUMI_STACK}"
                    }

                    sh "pulumi stack select ${PULUMI_STACK}"                    
                    
                    
                }
            }
        }

        stage('Pulumi Up') {
            steps {
                script {

                    // Create a script file for Pulumi up command
                    writeFile file: 'pulumi-up.sh', text: '''
                        #!/bin/bash
                        pulumi destroy --yes
                    '''
                    
                    // Make the script executable
                    sh 'chmod +x pulumi-up.sh'

                    // Execute Pulumi up
                    withCredentials([string(credentialsId: 'pulumi-access-token', variable: 'PULUMI_ACCESS_TOKEN')]) {
                        sh 'export PATH="/var/lib/jenkins/.pulumi/bin:$PATH"'
                        sh 'export npm_PATH="/usr/share/npm:$npm_PATH"'
                        sh 'npm install'

                        //def stackExists = sh(script: 'pulumi stack ls --json', returnStatus: true).toInteger() == 0
                        

                        // Initialize or select the stack
                        //sh "pulumi stack ${stackExists ? 'select' : 'init'} ${PULUMI_STACK}"
                        //sh 'pulumi stack init ${PULUMI_STACK}'
                        //sh 'pulumi stack select ${PULUMI_STACK}'
                        sh 'npm install @pulumi/pulumi && npm install @pulumi/aws'
                        sh './pulumi-up.sh'
                    }
                }
            }
        }

        //stage('Execute Kubernetes YAML Files') {
            //steps {
                //script {
                    //echo 'Applying Kubernetes YAML files to the cluster'
                    // Use kubectl to apply your Kubernetes YAML files
                     //aws eks --region "${REGION}" update-kubeconfig --name "${CLUSTER_NAME}"
                     //sh 'kubectl apply -f StorageClass.yaml'
                     //sh 'kubectl apply -f pvc.yaml'
                     //sh 'kubectl apply -f Statefulset.yaml'
                     //sh 'kubectl apply -f S Service.yaml'
                //}
            //}
        //}
    }

    post {
            failure {
                script {
                    echo 'Destroying EKS cluster due to pipeline failure'
                    // Run Pulumi destroy in case of pipeline failure
                    sh 'pulumi destroy --yes'
                }
            }

            success {
                script {
                    echo 'Pipeline executed successfully!'
                }
            }
        }
}
