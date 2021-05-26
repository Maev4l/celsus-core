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
    stages {
        stage ('Build') {
            environment {
                COVERALLS_TOKEN = credentials('celsus-core-coveralls-token')
            }
            steps {
                script {
                    withDockerNetwork { network -> 
                        docker.image('postgres:10.3-alpine').withRun('--name postgres-${network} --network ${network} -e POSTGRES_PASSWORD=  -d') { db ->
                            docker.image('localstack/localstack:0.12.11').withRun('--name localstack-${network} -d --network ${network} -e SERVICES=s3 -e DEFAULT_REGION=eu-central-1') { localstack ->
                                docker.image('node:14-alpine').inside("--network ${network} -e PGHOST=postgres-${network} -e AWS_MOCK=localstack-${network} -e COVERALLS_GIT_BRANCH=${env.GIT_BRANCH} -e COVERALLS_SERVICE_NAME=internal-jenkins -e COVERALLS_REPO_TOKEN=${COVERALLS_TOKEN}") {
                                    sh 'apk update && apk add --no-cache postgresql-client curl'
                                    sh 'yarn install'
                                    sh './wait-localstack.sh'
                                    sh 'yarn build:ci'
                                    sh 'yarn coverage'
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}