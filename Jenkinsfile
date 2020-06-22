#!groovy

import groovy.json.JsonSlurperClassic

node {

    // Parameters
    // -------------------------------------------------------------------------
    // SF_DEV_USERNAME
    // SF_DEV_CONSUMER_KEY
    // SF_DEV_CREDENTIAL
    // TEST_LEVEL
    // SF_INSTANCE_URL

    // SF_PACKING_USERNAME
    // SF_PACKING_CONSUMER_KEY
    // SF_PACKING_CREDENTIAL

    // PACKAGE_NAME
    // PACKAGE_VERSION_NAME
    // PACKAGE_VERSION_NUMBER
    // PACKAGE_DESCRIPTION
    // PACKAGE_METADATA_ID

    // GITHUB_TOKEN
    // GITHUB_USERNAME
    // GITHUB_REPOSITORY
    // GITHUB_TAG
    // GITHUB_DRAFT
    // GITHUB_PRERELEASE
    // -------------------------------------------------------------------------
    def sfdx = tool 'sfdx'
    // windows env - SFDX CLI installation directory: C:\Program Files\Salesforce CLI\bin\sfdx
    // ubuntu env  - SFDX CLI installation directory: /usr/local/bin/sfdx
    if (isUnix()) {
        sfdx = "${sfdx}"
    } else {
        sfdx = "\"${sfdx}\""
    }
    // store the request upload package id
    def uploadRequestId
    // store uploaded package URL
    def uploadedPackageURL

    // -------------------------------------------------------------------------
    // Check out code from source control.
    // -------------------------------------------------------------------------

    stage('checkout source') {
        checkout scm
    }


    // -------------------------------------------------------------------------
    // Run all the enclosed stages with access to the Salesforce
    // JWT key credentials.
    // -------------------------------------------------------------------------

    withEnv(["HOME=${env.WORKSPACE}"]) {

        withCredentials([
            file(credentialsId: SF_DEV_CREDENTIAL, variable: 'server_key_file'),
            file(credentialsId: SF_PACKING_CREDENTIAL, variable: 'packing_key_file'),
            string(credentialsId: GITHUB_TOKEN, variable: 'ghToken')
        ]) {

            // -------------------------------------------------------------------------
            // Remove authentication to avoid JSON web token error:
            // https://developer.salesforce.com/forums/?id=9062I000000XrgnQAC
            // -------------------------------------------------------------------------

            stage('Prepare Authorize') {
                command "${sfdx} force:auth:logout --targetusername ${SF_DEV_USERNAME} -p"
                command "${sfdx} force:auth:logout --targetusername ${SF_PACKING_USERNAME} -p"
            }


            // -------------------------------------------------------------------------
            // Authorize the Dev Hub org with JWT key and give it an alias.
            // -------------------------------------------------------------------------

            stage('Authorize DevHub') {
                if (isUnix()) {
                    rc = command "${sfdx} force:auth:jwt:grant --instanceurl ${SF_INSTANCE_URL} --clientid ${SF_DEV_CONSUMER_KEY} --username ${SF_DEV_USERNAME} --jwtkeyfile ${server_key_file} --setdefaultdevhubusername --setalias HubOrg"
                } else {
                    rc = command "${sfdx} force:auth:jwt:grant --instanceurl ${SF_INSTANCE_URL} --clientid ${SF_DEV_CONSUMER_KEY} --username ${SF_DEV_USERNAME} --jwtkeyfile \"${server_key_file}\" --setdefaultdevhubusername --setalias HubOrg"
                }
                if (rc != 0) {
                    error 'Salesforce dev hub org authorization failed.'
                }
            }


            // -------------------------------------------------------------------------
            // Create new scratch org to test your code.
            // -------------------------------------------------------------------------

            stage('Create Test Scratch Org') {
                rc = command "${sfdx} force:org:create --targetdevhubusername HubOrg --setdefaultusername --definitionfile config/project-scratch-def.json --setalias ciorg --wait 10 --durationdays 1"
                if (rc != 0) {
                    error 'Salesforce test scratch org creation failed.'
                }

                orginfo = command "${sfdx} force:org:display --targetusername ciorg"
                if (orginfo != 0) {
                    error 'Salesforce test scratch org display failed.'
                }
            }


            // -------------------------------------------------------------------------
            // Push source to test scratch org.
            // -------------------------------------------------------------------------

            stage('Push To Test Scratch Org') {
                // rc = command "${sfdx} force:source:push --targetusername ciorg"
                // for manifest file
                rc = command "${sfdx} force:source:deploy -x manifest/package.xml --targetusername ciorg"
                if (rc != 0) {
                    error 'Salesforce push to test scratch org failed.'
                }
            }


            // -------------------------------------------------------------------------
            // Run unit tests in test scratch org.
            // -------------------------------------------------------------------------

            stage('Run Tests In Test Scratch Org') {
                if (isUnix()) {
                    output = sh returnStdout: true, script: "${sfdx} force:apex:test:run --targetusername ciorg --wait 10 --resultformat tap --codecoverage --json --testlevel ${TEST_LEVEL}"
                } else {
                    output = bat(returnStdout: true, script: "${sfdx} force:apex:test:run --targetusername ciorg --wait 10 --resultformat tap --codecoverage --json --testlevel ${TEST_LEVEL}").trim()
                    output = output.readLines().drop(1).join(" ")
                }

                def jsonSlurper = new JsonSlurperClassic()
                def response = jsonSlurper.parseText(output)

                def outcome = response.result.summary.outcome
                if (outcome != "Passed") {
                    echo response
                    error 'Salesforce unit test run in test scratch org failed.'
                } else {
                    echo 'test result:'
                    echo "${response.result}"
                }

                response = null
            }


            // -------------------------------------------------------------------------
            // Delete test scratch org.
            // -------------------------------------------------------------------------

            stage('Delete Test Scratch Org') {
                rc = command "${sfdx} force:org:delete --targetusername ciorg --noprompt"
                if (rc != 0) {
                    error 'Salesforce test scratch org deletion failed.'
                }
            }


            // -------------------------------------------------------------------------
            // Authorize the Package org with JWT key and give it an alias.
            // -------------------------------------------------------------------------

            stage('Authorize Package Org') {
                if (isUnix()) {
                    rc = command "${sfdx} force:auth:jwt:grant --instanceurl ${SF_INSTANCE_URL} --clientid ${SF_PACKING_CONSUMER_KEY} --username ${SF_PACKING_USERNAME} --jwtkeyfile ${packing_key_file} --setalias PkgOrg"
                } else {
                    rc = command "${sfdx} force:auth:jwt:grant --instanceurl ${SF_INSTANCE_URL} --clientid ${SF_PACKING_CONSUMER_KEY} --username ${SF_PACKING_USERNAME} --jwtkeyfile \"${packing_key_file}\" --setalias PkgOrg"
                }
                if (rc != 0) {
                    error 'Salesforce package org authorization failed.'
                }
            }


            // -------------------------------------------------------------------------
            // Convert code to metadata.
            // -------------------------------------------------------------------------

            stage('Convert code to metadata') {
                rc = command "${sfdx} force:source:convert -x manifest/package.xml -d mdapi-source/updated-package -n \"${PACKAGE_NAME}\""
                if (rc != 0) {
                    error 'Convert code to metadata failed.'
                }
            }


            // -------------------------------------------------------------------------
            // Push source to Package org.
            // -------------------------------------------------------------------------

            stage('Push To Package Org') {
                // rc = command "${sfdx} force:mdapi:deploy -d mdapi-source/updated-package --targetusername PkgOrg --testlevel ${TEST_LEVEL} -w -1"
                rc = command "${sfdx} force:mdapi:deploy -d mdapi-source/updated-package --targetusername PkgOrg --testlevel RunSpecifiedTests --runtests JenkinsCITest -w -1"
                if (rc != 0) {
                    error 'Salesforce push to Package org failed.'
                }
            }


            // -------------------------------------------------------------------------
            // Start Upload Package in Package org.
            // -------------------------------------------------------------------------

            stage('Upload Package in Package org') {
                // --managedreleased: Creates a managed package version. To create a beta version, don’t include this parameter.
                if (isUnix()) {
                    output = sh returnStdout: true, script: "${sfdx} force:package1:version:create --packageid ${PACKAGE_METADATA_ID} -n \"${PACKAGE_VERSION_NAME}\" -v \"${PACKAGE_VERSION_NUMBER}\" -d \"${PACKAGE_DESCRIPTION}\" --wait -1 --json --targetusername PkgOrg"
                } else {
                    output = bat(returnStdout: true, script: "${sfdx} force:package1:version:create --packageid ${PACKAGE_METADATA_ID} -n \"${PACKAGE_VERSION_NAME}\" -v \"${PACKAGE_VERSION_NUMBER}\" -d \"${PACKAGE_DESCRIPTION}\" --wait -1 --json --targetusername PkgOrg").trim()
                    output = output.readLines().drop(1).join(" ")
                }

                def jsonSlurper = new JsonSlurperClassic()
                def uploadResponse = jsonSlurper.parseText(output)
                uploadRequestId = uploadResponse.result.Id

                echo "Upload start with ID ${uploadRequestId}"

            }


            // -------------------------------------------------------------------------
            // Check Upload Package Progress
            // -------------------------------------------------------------------------

            stage('Check Upload Package Progress') {
                def PACKAGE_METADATA_VERSION_ID
                def loopCount = 60 // wait 30 seconds for each retrieve status (30*60=1800==30minutes)
                int count = 0
                // for (int i = 0; i < loopCount; i++) {
                while (count < loopCount) {
                    // Wait 30 seconds for package upload.
                    sleep(time:30,unit:"SECONDS")

                    if (isUnix()) {
                        statusResponse = sh returnStdout: true, script: "${sfdx} force:package1:version:create:get -i ${uploadRequestId} --json --targetusername PkgOrg"
                    } else {
                        statusResponse = bat(returnStdout: true, script: "${sfdx} force:package1:version:create:get -i ${uploadRequestId} --json --targetusername PkgOrg").trim()
                        statusResponse = statusResponse.readLines().drop(1).join(" ")
                    }

                    // https://developer.salesforce.com/docs/atlas.en-us.api_tooling.meta/api_tooling/tooling_api_objects_packageuploadrequest.htm
                    def jsonStatusSlurper = new JsonSlurperClassic()
                    def uploadStatusResponse = jsonStatusSlurper.parseText(statusResponse)
                    def uploadStatus = uploadStatusResponse.result.Status

                    if (uploadStatus == "SUCCESS") {
                        PACKAGE_METADATA_VERSION_ID = uploadStatusResponse.result.MetadataPackageVersionId
                        break
                    }
                    else if (uploadStatus == "Error") {
                        error "Upload error: ${uploadStatusResponse.result.Errors}"
                        break
                    }
                    else if (uploadStatus == "Queued") {
                        echo "Upload is in Queued"
                    }
                    else if (uploadStatus == "In Progress") {
                        echo "Upload is In Progress"
                    }
                    else {
                        echo "Unexpected package upload status: ${uploadStatus}"
                    }

                    if (count == loopCount - 1) {
                        // timeout
                        error 'Upload Package timeout: the upload progress is more than 30 minutes. Please check the progress in the Package Manager page of your Package Org.'
                    }
                    count++
                }

                echo "Install url for ${PACKAGE_NAME} - version ${PACKAGE_VERSION_NAME}: https://login.salesforce.com/packaging/installPackage.apexp?p0=${PACKAGE_METADATA_VERSION_ID}"
                uploadedPackageURL = "https://login.salesforce.com/packaging/installPackage.apexp?p0=${PACKAGE_METADATA_VERSION_ID}"
                // an upload success/fail email will be sent to uploader email
            }

            // -------------------------------------------------------------------------
            // Create Github release
            // POST request using https://github.com/jenkinsci/http-request-plugin
            // -------------------------------------------------------------------------

            stage('Create Github release') {

                def description = "Package URL: ${uploadedPackageURL}"
                def RELEASE_URL = "https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}/releases"
                RELEASE_DATA = """{"tag_name": "$GITHUB_TAG", "name": "$GITHUB_TAG", "target_commitish": "master", "body": "$description", "draft": $GITHUB_DRAFT, "prerelease": $GITHUB_PRERELEASE}"""
                echo RELEASE_URL
                echo RELEASE_DATA

                def response = httpRequest customHeaders: [[name: 'Authorization', value: "Token ${ghToken}"]], acceptType: 'APPLICATION_JSON', contentType: 'APPLICATION_JSON', httpMode: 'POST', requestBody: RELEASE_DATA, url: RELEASE_URL

                echo "Status: ${response.status}"
                echo "Response: ${response.content}"

            }
        }
    }
}

def command(script) {
    if (isUnix()) {
        return sh(returnStatus: true, script: script);
    } else {
        return bat(returnStatus: true, script: script);
    }
}
