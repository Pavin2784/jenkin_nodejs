## CRUD-enabled Node.js app using Express and MySQL to manage a name list.
### Features:

✅ Add a name  
✅ Get all names  
✅ Get a name by ID  
✅ Update a name  
✅ Delete a name  

Clone the Repo in your Machine
```
git clone <url>
```


To install Node.js on your system, use the following commands:

```
sudo apt update -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```
Check version:

```
node -v
npm -v
```

## Set Environment
```
cd nodeserver
sudo npm install express mysql2 dotenv
```


### Change database host in database.env file     
```
DB_HOST=
DB_USER=
DB_PASS=
DB_NAME=
```


### Start the Server

```node server.js```

### Manually Check Sql Connection [ Optional ]

`mysql -h <sqlhost-ip> -u root -p`

### Open the Website using

`http://<server-ip>:3000`

