// define a shared map for results
def resultMap = [:]

pipeline {
    agent { label 'main' }

    parameters {
        choice(
            name: 'TARGET_AGENT',
            choices: ['All Agents', 'Agent 1', 'Agent 2', 'Agent 3', 'Agent 4', 'Agent 5'],
            description: 'Select which agent(s) to deploy to'
        )
    }

    environment {
        NODEJS_HOME   = tool name: 'NodeJS', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
        REPO_URL      = 'https://github.com/AslinDhurai/vite.git'
        NODE_OPTIONS  = "--openssl-legacy-provider"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', credentialsId: 'git-token', url: "${REPO_URL}"
                stash name: 'source-code', includes: '**/*'
            }
        }

        stage('Deploy to Agents') {
            steps {
                script {
                    // define which agents to attempt
                    def agents = [
                        'Agent 1': [label:'windows',      viteUrl:'http://192.168.52.33:8084'],
                        'Agent 2': [label:'Shahana-Agent',viteUrl:'http://192.168.52.84:8084'],
                        'Agent 3': [label:'Archana-agent',viteUrl:'http://192.168.52.25:8084'],
                        'Agent 4': [label:'Dharshana-agent',viteUrl:'http://192.168.52.56:8084'],
                        'Agent 5': [label:'Annie-Agent',  viteUrl:'http://192.168.52.171:8084']
                    ]

                    // build the parallel branches only for the selected agents
                    def branches = agents.findAll { name, cfg ->
                        params.TARGET_AGENT == 'All Agents' || params.TARGET_AGENT == name
                    }.collectEntries { name, cfg ->
                        [ name, {
                            // run deployment and capture the outcome
                            resultMap[name] = deployReactAppToAgent(
                                agentLabel: cfg.label,
                                agentName:   name,
                                viteApiUrl:  cfg.viteUrl
                            )
                        } ]
                    }

                    // execute all in parallel
                    parallel branches
                }
            }
        }
    }

    post {
        always {
            script {
                // summarize
                def successes = resultMap.findAll { k,v -> v.success }.keySet()
                def failures  = resultMap.findAll { k,v -> !v.success }.collect { k,v -> "${k} (${v.reason})" }

                def buildName   = env.JOB_NAME
                def buildNumber = env.BUILD_NUMBER
                def buildUrl    = env.BUILD_URL
                def status      = currentBuild.currentResult

                // compose the e-mail body
                def body = """\
                Deployment Report
                Build: ${buildName} #${buildNumber}

                Status: ${status}

                ✅ Successfully Deployed (${successes.size()})
                ${ successes ? successes.join('\n') : 'No successful deployments' }

                ❌ Failed Deployments (${failures.size()})
                ${ failures ? failures.join('\n') : 'No failed deployments' }

                View full logs: ${buildUrl}
                """.stripIndent()

                // send one consolidated email
                emailext(
                    to:      'demojenkinscicd@gmail.com',
                    subject: "Deployment Report: ${buildName} #${buildNumber}",
                    body:    body
                )
            }
        }
    }
}

// now returns a Map [ success: Boolean, reason: String? ] instead of throwing
def deployReactAppToAgent(Map args) {
    def (agentLabel, agentName, viteApiUrl) = [args.agentLabel, args.agentName, args.viteApiUrl]
    try {
        if (!isAgentOnline(agentName)) {
            return [ success: false, reason: 'offline' ]
        }
        node(agentLabel) {
            deleteDir()
            def nodeJS = tool name: 'NodeJS', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
            withEnv([
                "PATH+NodeJS=${nodeJS}/bin",
                "NODE_OPTIONS=${env.NODE_OPTIONS}"
            ]) {
                dir("build-${agentName}") {
                    unstash 'source-code'
                    writeFile file: '.env', text: "VITE_API_URL=${viteApiUrl}"
                    bat "npm install"
                    bat "npm run build"
                    stash name: "dist-${agentName}", includes: 'dist/**'
                }
                timeout(time: 2, unit: 'MINUTES') {
                    dir("deploy-${agentName}") {
                        unstash "dist-${agentName}"
                        bat '''
                            if exist "C:\\inetpub\\wwwroot\\my-app" (
                                rd /s /q "C:\\inetpub\\wwwroot\\my-app"
                            )
                            mkdir "C:\\inetpub\\wwwroot\\my-app"
                            xcopy "dist\\*" "C:\\inetpub\\wwwroot\\my-app" /E /I /Y
                        '''
                    }
                }
            }
        }
        return [ success: true ]
    } catch (e) {
        // capture any exception as a failure reason
        return [ success: false, reason: e.message ?: 'unknown error' ]
    }
}

@NonCPS
def isAgentOnline(String name) {
    def agent = Jenkins.instance.getNode(name)
    if (agent == null) {
        return false
    }
    def computer = agent.toComputer()
    return computer?.isOnline()
}
