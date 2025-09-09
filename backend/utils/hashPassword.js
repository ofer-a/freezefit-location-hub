import {hash,genSalt,compare} from 'bcrypt'

export const hashPassword = async (password) => {
    if(password === undefined || password === null || password === '') {
        throw new Error('Password cannot be empty');
    }
    const salt = await genSalt(10);
    console.log('salt :' ,salt);
    return hash(password, salt);
}

export const comparePassword = async (plainPassword,hashedPassword) => {
    console.log('Comparing passwords');
    return compare(plainPassword,hashedPassword);
}

