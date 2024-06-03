#!/bin/bash -x

INPUT=$1
APP_ID=$2
NEEDS_UNZIP=false
UUID_REGEX='"uuid"\s*:\s*"([^"]+)'
STATUS_REGEX='"status"\s*:\s*"([^"]+)'

# if folder, zip it
if [ -d "${INPUT}" ]; then
    NEEDS_UNZIP=true
    zip -r -q -y unsigned.zip "${INPUT}"
    rm -rf "${INPUT}"
    INPUT=unsigned.zip
fi

# notarize over curl
RESPONSE=$(curl -X POST -F file=@"${INPUT}" -F 'options={"primaryBundleId": "'${APP_ID}'", "staple": true};type=application/json' https://cbi.eclipse.org/macos/xcrun/notarize)

# fund uuid and status
[[ $RESPONSE =~ $UUID_REGEX ]]
UUID=${BASH_REMATCH[1]}
[[ $RESPONSE =~ $STATUS_REGEX ]]
STATUS=${BASH_REMATCH[1]}

# poll progress
echo "  Progress: $RESPONSE"
while [[ $STATUS == 'IN_PROGRESS' ]]; do
    sleep 120
    RESPONSE=$(curl -s https://cbi.eclipse.org/macos/xcrun/${UUID}/status)
    [[ $RESPONSE =~ $STATUS_REGEX ]]
    STATUS=${BASH_REMATCH[1]}
    echo "  Progress: $RESPONSE"
done

if [[ $STATUS != 'COMPLETE' ]]; then
    echo "Notarization failed: $RESPONSE"
    exit 1
fi

# download stapled result
curl -o "notarized.zip" https://cbi.eclipse.org/macos/xcrun/${UUID}/download
