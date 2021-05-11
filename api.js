const fetch = require('node-fetch')

const ENDPOINT = 'https://champion-weasel-77.hasura.app/v1/graphql'

async function APIcall(query, variables, operationName) {
    const response = await fetch(
        ENDPOINT,
        {
            method: 'POST',
            body: JSON.stringify({
                query,
                variables,
                operationName,
            }),
        }
    )

    const parsed = await response.json()

    const { data, errors } = parsed

    if (errors) {
        throw `graphql error: ${JSON.stringify(errors[0].message)}`
    }

    return data
}

module.exports = {
    APIcall
}
