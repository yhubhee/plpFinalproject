const { MongoClient } = require('mongodb');

// Replace with your actual MongoDB URI
const uri = "mongodb+srv://emenyiubongabasi415_db_user:yhubhee@cluster0.igdt4as.mongodb.net/plp_bookstore";
const dbName = "plp_bookstore";
const collectionName = "books";

async function runQueries() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // --------------------- BASIC QUERIES ---------------------
        // 1. Find all books in a specific genre
        const booksInGenre = await collection.find({ genre: "Fiction" }).toArray();
        console.log("\n📚 Fiction Books:", booksInGenre);

        // 2. Find books published after a certain year
        const modernBooks = await collection.find({ published_year: { $gt: 2000 } }).toArray();
        console.log("\n📚 Books published after 2000:", modernBooks);

        // 3. Find books by a specific author
        const orwellBooks = await collection.find({ author: "George Orwell" }).toArray();
        console.log("\n📚 Books by George Orwell:", orwellBooks);

        // 4. Update the price of a specific book
        const updateResult = await collection.updateOne(
          { title: "1984" },
          { $set: { price: 14.99 } }
        );
        console.log(`\n✅ ${updateResult.modifiedCount} document(s) updated`);

        // 5. Delete a book by its title
        const deleteResult = await collection.deleteOne({ title: "Animal Farm" });
        console.log(`\n🗑️ ${deleteResult.deletedCount} document(s) deleted`);

        // Show final books
        const allBooks = await collection.find({}).toArray();
        console.log("\n📚 Final Books in DB:", allBooks);

        // --------------------- TASK 3: ADVANCED QUERIES ---------------------
        // Find books that are both in stock and published after 2010
        const inStockBooks = await collection.find({ in_stock: true, published_year: { $gt: 2010 } }).toArray();
        console.log("\n✅ In-stock books published after 2010:", inStockBooks);

        // Use projection to return only the title, author, and price
        const projectedBooks = await collection
            .find({}, { projection: { title: 1, author: 1, price: 1, _id: 0 } })
            .toArray();
        console.log("\n📘 Projected Books (title, author, price):", projectedBooks);

        // Sort by price ascending
        const booksAsc = await collection.find({}, { projection: { title: 1, price: 1 } }).sort({ price: 1 }).toArray();
        console.log("\n📈 Books sorted by price (ascending):", booksAsc);

        // Sort by price descending
        const booksDesc = await collection.find({}, { projection: { title: 1, price: 1 } }).sort({ price: -1 }).toArray();
        console.log("\n📉 Books sorted by price (descending):", booksDesc);

        // Pagination: limit & skip
        const page = 1; 
        const limit = 5;
        const skip = (page - 1) * limit;

        const paginatedBooks = await collection
            .find({}, { projection: { title: 1, author: 1, price: 1, _id: 0 } })
            .skip(skip)
            .limit(limit)
            .toArray();
        console.log(`\n📄 Page ${page} (5 books per page):`, paginatedBooks);

        // --------------------- TASK 4: AGGREGATION PIPELINE ---------------------
        // 1. Average price of books by genre
        const avgPriceByGenre = await collection.aggregate([
            { $group: { _id: "$genre", averagePrice: { $avg: "$price" } } },
            { $sort: { averagePrice: -1 } }
        ]).toArray();
        console.log("\n💰 Average price of books by genre:", avgPriceByGenre);

        // 2. Author with the most books
        const topAuthor = await collection.aggregate([
            { $group: { _id: "$author", totalBooks: { $sum: 1 } } },
            { $sort: { totalBooks: -1 } },
            { $limit: 1 }
        ]).toArray();
        console.log("\n🏆 Author with the most books:", topAuthor);

        // 3. Group books by publication decade and count them
        const booksByDecade = await collection.aggregate([
            {
                $group: {
                    _id: { $subtract: [{ $divide: ["$published_year", 10] }, { $mod: [{ $divide: ["$published_year", 10] }, 1] }] },
                    totalBooks: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]).toArray();
        console.log("\n📚 Books grouped by publication decade:", booksByDecade);

        // --------------------- TASK 5: INDEXING ---------------------
        // 1. Create index on title
        await collection.createIndex({ title: 1 });
        console.log("\n⚙️ Created index on title");

        // 2. Create compound index on author and published_year
        await collection.createIndex({ author: 1, published_year: -1 });
        console.log("⚙️ Created compound index on author and published_year");

        // 3. Use explain() to demonstrate performance improvement
        const explainBefore = await collection.find({ title: "1984" }).explain("executionStats");
        console.log("\n🧠 Query Performance (with index):", explainBefore.executionStats);

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await client.close();
        console.log("🔒 Connection closed");
    }
}

// Run the function
runQueries().catch(console.error);
