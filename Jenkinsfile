pipeline {

    agent any

    environment {
        IMAGE = "pavinb/node"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Image') {
            steps {
                sh '''
                    docker build -t ${IMAGE}:${BUILD_NUMBER} ./app
                '''
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'docker',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login \
                            -u "$DOCKER_USERNAME" \
                            --password-stdin
                    '''
                }
            }
        }

        stage('Push Image') {
            steps {
                sh '''
                    docker push ${IMAGE}:${BUILD_NUMBER}
                '''
            }
        }

        stage('Creating Secrets') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'mysql',
                        usernameVariable: 'DB_USER',
                        passwordVariable: 'DB_PASS'
                    )
                ]) {
                    sh '''
                        kubectl create secret generic node-secret \
                            --from-literal=DB_USER="$DB_USER" \
                            --from-literal=DB_PASS="$DB_PASS" \
                            --dry-run=client -o yaml | kubectl apply -f -
                    '''
                }
            }
        }

        stage('Deploy Kubernetes') {
            steps {
                sh '''
                    kubectl apply -f k8s/
                '''
            }
        }

        stage('Update Image') {
            steps {
                sh '''
                    kubectl set image deployment/node-deployment \
                        node=${IMAGE}:${BUILD_NUMBER}
                '''
            }
        }

        stage('Rollout Status') {
            steps {
                sh '''
                    kubectl rollout status deployment/node-deployment \
                        --timeout=5m
                '''
            }
        }
    }
}

