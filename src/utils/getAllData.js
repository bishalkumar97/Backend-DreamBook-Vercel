const APIFeatures = require("./apiFeatures");
const { filteredResults } = require("./advanceFilter");

async function getAllData(model, query, populateConfig) {
    console.log("Received query for data retrieval:", query); // Debug log the received query

    const page = query.page && parseInt(query.page, 10) > 0 ? parseInt(query.page, 10) : 1;
    const limit = query.limit && parseInt(query.limit, 10) > 0 ? parseInt(query.limit, 10) : 10;

// FIX HERE NEW: Handle "oldToNew" or "newToOld" for sorting
    // If the client sends ?sort=oldToNew, we will replace it with "createdAt"
    // If the client sends ?sort=newToOld, we will replace it with "-createdAt"
    // if (query.sort === 'oldToNew') {              // FIX HERE NEW
    //     query.sort = 'createdAt';                  // FIX HERE NEW (ascending by createdAt)
    //   } else if (query.sort === 'newToOld') {       // FIX HERE NEW
    //     query.sort = '-createdAt';                 // FIX HERE NEW (descending by createdAt)
    //   }
    //   // FIX HERE NEW: End of sort handling

     // ✅ HELLO: FIXED - Status filtering
     let filterConditions = {}; 
     if (query.status && query.status !== "All") {
         filterConditions.status = query.status.trim(); // HELLO: Apply status filter
     }
 
     // ✅ HELLO: FIXED - Sorting logic
     let sortOption = "-createdAt"; // Default sorting: newest first
     if (query.sort) {
         switch (query.sort) {
             case "oldToNew":
                 sortOption = "createdAt"; // HELLO: Sort by oldest first
                 break;
             case "titleAsc":
                 sortOption = "title"; // HELLO: Sort by title (A-Z)
                 break;
             case "titleDesc":
                 sortOption = "-title"; // HELLO: Sort by title (Z-A)
                 break;
         }
     }

     
    // ✅ HELLO: Apply filters
    let dataQuery = model.find(filterConditions); 

    // let dataQuery = model.find({});

    // Apply population dynamically based on the provided configuration
    // if (populateConfig) {
    //     populateConfig.forEach(({ path, select, subPopulate }) => {
    //         const populateOptions = { path, select };
    //         if (subPopulate) {
    //             populateOptions.populate = subPopulate;
    //         }
    //         dataQuery = dataQuery.populate(populateOptions);
    //     });
    // }

    // let data = new APIFeatures(dataQuery, query).filter().sort().paginate();
    // data = await data.query.lean(); // Fix: use the result of the chained methods

    // const totalResults = await filteredResults(model, query);
    // const totalPages = Math.ceil(totalResults / limit);

       // ✅ HELLO: Populate dynamically
       if (populateConfig) {
        populateConfig.forEach(({ path, select, subPopulate }) => {
            const populateOptions = { path, select };
            if (subPopulate) {
                populateOptions.populate = subPopulate;
            }
            dataQuery = dataQuery.populate(populateOptions); // HELLO: Apply population
        });
    }

    // ✅ HELLO: Apply filtering, sorting, and pagination
    let data = new APIFeatures(dataQuery, query).filter().paginate(); 
    data = await data.query.sort(sortOption).lean(); // HELLO: Sorting applied here

    // ✅ HELLO: Get total count of results
    const totalResults = await filteredResults(model, query);
    const totalPages = Math.ceil(totalResults / limit);

    return {
        page,
        limit,
        // results: data,
        results: Array.isArray(data) ? data : [], // ✅ Ensure results is always an array
        totalPages,
        totalResults,
    };
}

module.exports = {
    getAllData
}
