import { pool } from "../database/postgre.js";

const exampleUsersJson = [{
    "name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "password": "hashedPassword",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z",
    "allow_validate_exam": false,
    "allow_handle_users": false

}, {
    "name": "Jane",
    "last_name": "Doe",
    "email": "jane.doe@example.com",
    "password": "hashedPassword",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z",
    "allow_validate_exam": true,
    "allow_handle_users": true
}, 
{
    "name": "pedro",
    "last_name": "perez",
    "email": "pedro.perez@example.com",
    "password": "hashedPassword",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z",
    "allow_validate_exam": false,
    "allow_handle_users": true
}
];
 
class User {
    constructor(userData) {
        this.id = userData.id;
        this.name = userData.name;
        this.last_name = userData.last_name;
        this.email = userData.email;
        this.password = userData.password;
        this.status = userData.status;
        this.created_at = userData.created_at;
        this.updated_at = userData.updated_at;

        // Validate and set boolean fields
        this.allow_validate_exam = this._validateBoolean(userData.allow_validate_exam, 'allow_validate_exam');
        this.allow_handle_users = this._validateBoolean(userData.allow_handle_users, 'allow_handle_users');
    }

    // Helper method to validate boolean fields
    _validateBoolean(value, fieldName) {
        if (value === undefined || value === null) {
            return false; // Default to false if not provided
        }

        if (typeof value === 'boolean') {
            return value;
        }

        // Handle string representations
        if (typeof value === 'string') {
            const lowerValue = value.toLowerCase();
            if (lowerValue === 'true' || lowerValue === '1') return true;
            if (lowerValue === 'false' || lowerValue === '0') return false;
        }

        // Handle numbers
        if (typeof value === 'number') {
            return Boolean(value);
        }

        throw new Error(`${fieldName} must be a boolean value (true/false)`);
    }



    // Create a new user (admin-created flow)
    static async create(userData) {
        // Build query with all necessary fields for admin-created users
        const query = `
            INSERT INTO users (
                name, 
                last_name, 
                email, 
                status, 
                allow_validate_exam, 
                allow_handle_users,
                created_at, 
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *
        `;

        const values = [
            userData.name.trim(),
            userData.last_name ? userData.last_name.trim() : null,
            userData.email.toLowerCase().trim(),
            'pendiente',  // Always pendiente for admin-created users
            userData.allow_validate_exam || false,
            userData.allow_handle_users || false
        ];

        try {
            const result = await pool.query(query, values);
            return new User(result.rows[0]);
        } catch (error) {
            if (error.code === '23505') { // PostgreSQL unique violation error code
                throw new Error("User with this email already exists");
            }
            throw error;
        }
    }

    // Find user by email
    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email.toLowerCase().trim()]);

        if (result.rows.length === 0) {
            return null;
        }

        return new User(result.rows[0]);
    }

    // Find user by ID
    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return null;
        }

        return new User(result.rows[0]);
    }

    // Find all users
    static async findAll() {
        const query = 'SELECT * FROM users ORDER BY created_at DESC';
        const result = await pool.query(query);

        return result.rows.map(row => new User(row));
    }

    // Static method to update user by ID
    static async updateById(id, updateData) {
        const allowedFields = ['name', 'last_name', 'email', 'password', 'status', 'allow_validate_exam', 'allow_handle_users'];
        const updates = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key) && value !== undefined) {
                updates.push(`${key} = $${paramCount}`);

                // Handle different field types
                if (key === 'email') {
                    values.push(value.toLowerCase().trim());
                } else if (key === 'allow_validate_exam' || key === 'allow_handle_users') {
                    // For static method, we need to validate booleans differently
                    if (typeof value === 'boolean') {
                        values.push(value);
                    } else if (typeof value === 'string') {
                        const lowerValue = value.toLowerCase();
                        values.push(lowerValue === 'true' || lowerValue === '1');
                    } else {
                        values.push(Boolean(value));
                    }
                } else {
                    values.push(value);
                }
                paramCount++;
            }
        }

        if (updates.length === 0) {
            throw new Error("No valid fields to update");
        }

        updates.push(`updated_at = NOW()`);
        values.push(id);

        const query = `
            UPDATE users
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        try {
            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                throw new Error("User not found");
            }

            return new User(result.rows[0]);
        } catch (error) {
            if (error.code === '23505') {
                throw new Error("User with this email already exists");
            }
            throw error;
        }
    }

    // Instance method to update current user
    async update(updateData) {
        const allowedFields = ['name', 'last_name', 'email', 'allow_validate_exam', 'allow_handle_users'];
        const updates = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key) && value !== undefined) {
                updates.push(`${key} = $${paramCount}`);

                // Handle different field types
                if (key === 'email') {
                    values.push(value.toLowerCase().trim());
                } else if (key === 'allow_validate_exam' || key === 'allow_handle_users') {
                    values.push(this._validateBoolean(value, key));
                } else {
                    values.push(value.trim());
                }
                paramCount++;
            }
        }

        if (updates.length === 0) {
            throw new Error("No valid fields to update");
        }

        updates.push(`updated_at = NOW()`);
        values.push(this.id);

        const query = `
            UPDATE users
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        try {
            const result = await pool.query(query, values);
            const updatedUser = new User(result.rows[0]);

            // Update current instance
            Object.assign(this, updatedUser);
            return this;
        } catch (error) {
            if (error.code === '23505') {
                throw new Error("User with this email already exists");
            }
            throw error;
        }
    }

    // Delete user
    async delete() {
        const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [this.id]);

        if (result.rows.length === 0) {
            throw new Error("User not found");
        }

        return true;
    }

    // Convert to JSON (exclude password)
    toJSON() {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}

export default User;
