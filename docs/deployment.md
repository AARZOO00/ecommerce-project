# Deployment Guide (AWS)

This guide provides a step-by-step process for deploying the e-commerce application on AWS.

## Prerequisites

- An AWS account
- Node.js and npm installed on your local machine
- The AWS CLI installed and configured

## 1. Set up the Database (MongoDB Atlas)

For a production environment, it's recommended to use a managed database service like MongoDB Atlas.

1.  **Create a MongoDB Atlas account:** Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up.
2.  **Create a new cluster:** Choose a cloud provider and region.
3.  **Configure IP Access:** Add your server's IP address to the IP access list.
4.  **Create a database user:** Create a user with read/write access to the database.
5.  **Get the connection string:** Copy the connection string for your cluster. You will use this in your backend's `.env` file.

## 2. Deploy the Backend to EC2

### 2.1. Launch an EC2 Instance

1.  Go to the EC2 console in AWS.
2.  Click "Launch Instance".
3.  Choose an Amazon Machine Image (AMI), such as "Ubuntu Server".
4.  Choose an instance type (e.g., `t2.micro` for testing).
5.  Configure security groups to allow inbound traffic on ports 22 (SSH), 80 (HTTP), and 443 (HTTPS).
6.  Launch the instance.

### 2.2. Connect to the EC2 Instance

```bash
ssh -i /path/to/your-key.pem ubuntu@your_ec2_public_ip
```

### 2.3. Install Node.js, npm, and Git

```bash
sudo apt update
sudo apt install -y nodejs npm git
```

### 2.4. Clone the Repository and Install Dependencies

```bash
git clone https://your-repository-url.com/ecommerce-project.git
cd ecommerce-project/backend
npm install --production
```

### 2.5. Configure Environment Variables

Create a `.env` file in the `backend` directory and add your production environment variables:

```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=a_very_strong_and_long_jwt_secret
```

### 2.6. Run the Application with a Process Manager (PM2)

PM2 is a process manager for Node.js applications that will keep your app running in the background and restart it if it crashes.

```bash
sudo npm install -g pm2
pm2 start src/server.js --name "ecommerce-backend"
```

## 3. Set up Nginx as a Reverse Proxy

Nginx will act as a reverse proxy to forward incoming traffic on port 80 to your Node.js application running on port 5000.

### 3.1. Install Nginx

```bash
sudo apt install -y nginx
```

### 3.2. Configure Nginx

Create a new Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/ecommerce
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your_domain_or_ec2_ip;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the new configuration:

```bash
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

## 4. Deploy the Frontend (React/Next.js)

The frontend can be deployed to a service like AWS S3 (for static hosting) or Vercel (for Next.js).

### 4.1. Build the Frontend

```bash
cd ../frontend
npm install
npm run build
```

### 4.2. Deploy to AWS S3

1.  **Create an S3 bucket:** Go to the S3 console and create a new bucket.
2.  **Enable static website hosting:** In the bucket properties, enable static website hosting and specify the index document (e.g., `index.html`).
3.  **Upload the build files:** Upload the contents of your `frontend/build` directory to the S3 bucket.
4.  **Set bucket policy:** Make the bucket publicly accessible by adding a bucket policy.

### 4.3. Connect Frontend to Backend

In your frontend code, make sure your API requests are pointing to your backend's domain or IP address. You can use an environment variable for the API URL.

## 5. Set up a Domain and HTTPS

1.  **Register a domain:** Use a service like Amazon Route 53 to register a domain name.
2.  **Configure DNS:** Point your domain to your EC2 instance's IP address.
3.  **Install Certbot and get an SSL certificate:** Use Certbot to get a free SSL certificate from Let's Encrypt and automatically configure Nginx to use HTTPS.

```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx
```
