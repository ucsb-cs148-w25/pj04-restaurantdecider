import { DataTypes } from 'sequelize';

const userSchema = {
    username: DataTypes.STRING,
    hashedPassword: DataTypes.STRING
}

export default userSchema