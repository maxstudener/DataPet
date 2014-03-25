# DataPet

A web application for viewing databases and quickly navigating between relations.  Allows for multiple database connections and custom relation definitions configurable via web interface.  Navigate through data quickly using the relations button alongside each result set record.

### Currently Supported Databases

  * MySql
  * MSSQL
  * Progress/OpenEdge

### Requirements

  * MongoDB ( application database )
  * JRuby

### Installation

1. Clone Repo.
2. Create a secret_token.rb file in Rails.root/config/initializers.
3. Start the application.

### Database Drivers

  * SQL Server  
    Rename the jtds-<version>.jar file to jtds.jar and place it in Rails.root/lib.

  * Progress/OpenEdge 
    Place openedge.jar and pool.jar in Rails.root/lib.

### Adding Connections

Database connection can be added, edited, and deleted through the interface.  Database connections are made using the Sequel gem.

Example Configuration
```javascript
{
	"name": "SampleDB",
	"adapter": "jdbc",
	"username": "dataPet",
	"password": "dataPet",
	"driver": "com.ddtek.jdbc.openedge.OpenEdgeDriver",
	"url": "jdbc:datadirect:openedge://example.com:7910;databaseName=test",
	"db_type": "progress"
}
```

Note: Any key-value pair compatible with the Sequel gem will work.

### Adding Relations

After a database connection has been set-up you can start configuring relations.  The interface will auto-complete as much as possible and allows for relations across tables, through other relations, and across connections.  Once a relation has been set up. You can quickly access relation data after querying the 'from' table for the relation by clicking the numbered blue table cell for the any record in the result set.
