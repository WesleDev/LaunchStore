const db = require('../../config/db')

module.exports = {
     
    all() {
        return db.query(`
            SELECT * FROM products
            ORDER BY updated_at DESC
        `)
    },
    // Cadastra o produto no banco de dados
     create(data) {
        const query = `INSERT INTO products (
            category_id,
            user_id,
            name,
            description,
            old_price,
            price,
            quantity,
            status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`;

        // Irá salvar no banco sem a vírgula. Ex: 1,54 -> 154
        data.price = data.price.replace(/\D/g, '');
        const values = [
            data.category_id,
            data.user_id,
            data.name,
            data.description,
            data.old_price || data.price,
            data.price,
            data.quantity,
            data.status || 1
        ];

        return db.query(query, values);
    },
    find(id) {
        return db.query('SELECT * FROM products WHERE id = $1', [id])
    },
    update(data) {
        const query = `
            UPDATE products SET
                category_id=($1),
                name=($2),
                description=($3),
                old_price=($4),
                price=($5),
                quantity=($6),
                status=($7)
            WHERE id = $8   
        `
        const values = [
            data.category_id,
            data.name,
            data.description,
            data.old_price,
            data.price,
            data.quantity,
            data.status,
            data.id
        ]

        return db.query(query, values)
    },
    delete(id) {
        return db.query('DELETE FROM products WHERE id = $1', [id])
    },
    files(id) {
        return db.query('SELECT * FROM files WHERE product_id = $1', [id]);
    },
    search(params) {
        const { filter, category } = params

        let query = "",
            filterQuery = `WHERE`

        if (category) {
            filterQuery = `${filterQuery}
            products.category_id = ${category}
            AND`

            //WHERE products.category_id = 1
        }
        //se tiver erro é onde tem filters
        filterQuery = `
            ${filterQuery}
            products.name ilike '%${filter}%'
            OR products.description ilike '%${filter}%' 
        `
        //AND products.name ilike ...
        //OR products ...  

        query = `
            SELECT products.*,
                categories.name As category_name
            FROM products
            LEFT JOIN categories ON (categories.id = products.category_id)  
            ${filterQuery}  
        `
        return db.query(query)
    }   
}