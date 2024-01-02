export interface Details {
    id: Uint8Array
    username: string
    displayName: string
    credentials: Credential[]
    pendingChallenge?: BufferSource
    data: Data
}

interface Credential {
    key: CryptoKey
    descriptor: PublicKeyCredentialDescriptor
}

interface Data {
    registered: Date
    loginCount: number
    lastLogin: Date
}

const users: Details[] = []

const usernameValidity = /^[a-zA-Z0-9@\.\-_]+$/
export const InvalidUsername = Symbol("Error: Invalid Username")
export const AlreadyExists = Symbol("Error: User Already Exists")
export const NotFound = Symbol("Error: User Not Found")

export function create<Part extends Pick<Details, 'username'>>(userDetails: Part) {
    if (usernameValidity.test(userDetails.username) === false) return InvalidUsername

    for (const user of users) {
        if (user.username === userDetails.username) return AlreadyExists
    }

    const user: Details = {
        id: crypto.getRandomValues(new Uint8Array(32)),
        displayName: userDetails.username,
        credentials: [],
        data: { registered: new Date(), loginCount: 0, lastLogin: new Date() },
        ...userDetails
    }

    users.push(user)
    return user
}

export function read<Part extends Pick<Details, 'username'>>(userDetails: Part) {
    if (usernameValidity.test(userDetails.username) === false) return InvalidUsername

    for (const user of users) {
        if (user.username === userDetails.username) return user
    }

    return NotFound
}

type DeepPartial<T> = {
    [P in keyof T]?: Partial<T[P]>;
};
export function update<Part extends Pick<Details, 'username'> & DeepPartial<Details>>(userDetails: Part) {
    for (const user of users) {
        if (user.username === userDetails.username) {
            return Object.assign(user, userDetails, { data: { ...user.data, ...userDetails.data } })
        }
    }
    return NotFound
}

function delet<Part extends Pick<Details, 'username'>>(userDetails: Part) {
    for (const user of users) {
        if (user.username === userDetails.username) {
            return users.splice(users.indexOf(user), 1) && true
        }
    }
    return NotFound
}

export { delet as delete }
