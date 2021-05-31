def withDockerNetwork(Closure inner) {
    try {
        networkId = UUID.randomUUID().toString()
        sh "docker network create ${networkId}"
        inner.call(networkId)
    } finally {
        sh "docker network rm ${networkId}"
    }
}

pipeline { 
    agent any
    options { 
        buildDiscarder(logRotator(numToKeepStr: '3'))
        disableConcurrentBuilds()
        ansiColor('xterm')
    } 
    triggers {
        githubPush()
    }
    environment {
        COVERALLS_TOKEN = credentials('celsus-core-coveralls-token')
    }
    stages {
        stage ('Build') {
            steps {
                script {
                    withDockerNetwork { n -> 
                        docker.image('postgres:10.3-alpine').withRun("--name postgres-${n} --network ${n} -e POSTGRES_PASSWORD=  -d") { db ->
                            docker.image('localstack/localstack:0.12.11').withRun("--name localstack-${n} -d --network ${n} -e SERVICES=s3 -e DEFAULT_REGION=eu-central-1") { localstack ->
                                docker.image('671123374425.dkr.ecr.eu-central-1.amazonaws.com/jenkins/nodejs:14').inside("--network ${n} -e DB_HOST=postgres-${n} -e MOCK_AWS=localstack-${n}") {
                                    sh "yarn install"
                                    sh "./wait-localstack.sh localstack-${n}"
                                    sh "yarn build:ci"
                                    
                                    
                                    stash (name: "coverage-${env.JOB_BASE_NAME}-${env.GIT_BRANCH}-${env.BUILD_NUMBER}", allowEmpty:false)
                                    
                                }
                            }
                        }
                    }
                }
            }
        }
        stage ('Coverage') {
            agent { 
                docker {
                    image '671123374425.dkr.ecr.eu-central-1.amazonaws.com/jenkins/nodejs:14' 
                    args "-e COVERALLS_GIT_BRANCH=${env.GIT_BRANCH} -e COVERALLS_SERVICE_NAME=internal-jenkins -e COVERALLS_REPO_TOKEN=${COVERALLS_TOKEN}"
                }
            }
            steps {
                unstash (name: "coverage-${env.JOB_BASE_NAME}-${env.GIT_BRANCH}-${env.BUILD_NUMBER}")
                
                sh "yarn install"
                sh "yarn coverage"
            }
            when { branch 'master' }
        }
    }
}