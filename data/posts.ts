export interface Post {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  tags: string[];
  authors: string[];
}

export const posts: Post[] = [
  {
    id: "flask-apache",
    title: "Deploying Flask Application using Apache with mod_wsgi",
    summary: "Tutorial for deploying Flask Application using Apache with mod_wsgi",
    content: `We have written this blog to help developers deploy flask application with apache and mod_wsgi in production. The biggest caveat to deploying in production is version mismatches, so we are going to be building things from source rather than using apt-get to install packages.

## Build and install custom version of python

We used python 3.7.5 for a current project. Make sure you remove any other python version you might have on your machine.

### 1. Install Dependencies and packages

\`\`\`bash
sudo apt update
sudo apt install build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libsqlite3-dev libreadline-dev libffi-dev wget libbz2-dev
\`\`\`

### 2. Download source

\`\`\`bash
wget https://www.python.org/ftp/python/3.7.5/Python-3.7.5.tgz
\`\`\`

### 3. Compile python

\`\`\`bash
tar -xf Python-3.7.5.tgz
cd Python-3.7.5
./configure --enable-shared --prefix=/usr/
make -j4
sudo make install
\`\`\`

## Build and install custom version of wsgi mod

The problem in trying to force mod_wsgi to use a different Python installation than what it was compiled for is that the Python installation may itself not have been compiled with the same options. To avoid this problem we are going to build mod_wsgi from the source.

### 1. Compile wsgi-mod

\`\`\`bash
tar xvfz mod_wsgi-X.Y.tar.gz
cd mod_wsgi-X.Y
sudo apt-get install apache2-dev
./configure --with-python=/usr/bin/python
make -j4
sudo make install
\`\`\`

## Configure Apache

### 1. Install apache2

\`\`\`bash
sudo apt-get install apache2
\`\`\`

### 2. Configure Wsgi module

Create a file: \`/etc/apache2/mods-available/wsgi.load\`

Add the following line:
\`\`\`
LoadModule wsgi_module /usr/lib/apache2/modules/mod_wsgi.so
\`\`\`

Enable mod_wsgi:
\`\`\`bash
sudo a2enmod wsgi
sudo systemctl restart apache2
\`\`\`

## Deploying Flask Application

### 1. Create .wsgi file

\`\`\`python
import sys
sys.path.insert(0, '/var/www/<your_application_dir>')
from <your_application> import <flask_app> as application
\`\`\`

### 2. Create virtualenv

\`\`\`bash
cd /var/www/
virtualenv -p python3 <venv_name>
pip install -r requirements.txt
\`\`\`

### 3. Create Configuration file

Create \`/etc/apache2/sites-available/<your_application>.conf\`:

\`\`\`apache
<VirtualHost *:80>
    ServerName <Server_name>
    WSGIDaemonProcess <your_application> user=<user> group=<group> threads=5 \\
        python-home=/var/www/<venv_name>
    WSGIProcessGroup <your_application>
    WSGIApplicationGroup %{GLOBAL}
    WSGIScriptAlias / /var/www/<your_application_dir>/<your_application>.wsgi
    
    <Directory /var/www/<your_application_dir>/<your_application>/>
        Order allow,deny
        Allow from all
        Require all granted
    </Directory>
    
    Alias /static /var/www/<your_application_dir>/<your_application>/static
    <Directory /var/www/<your_application_dir>/<your_application>/static/>
        Order allow,deny
        Allow from all
    </Directory>
</VirtualHost>
\`\`\`

### 4. Enable application

\`\`\`bash
sudo a2ensite <your_application>
sudo systemctl restart apache2
\`\`\`

That's it! Your website is up and running on the public IP for the server.`,
    date: "2020-09-14",
    tags: ["Apache2", "Mod_wsgi", "Flask", "Deployment", "Ubuntu"],
    authors: ["Divyanshu Goyal", "Harish Krupo"]
  },
  {
    id: "ml-services",
    title: "Engineering High-Throughput, Low-Latency Machine Learning Services",
    summary: "Serving Machine Learning Models in Real-Time.",
    content: `This post discusses best practices and architectural patterns for serving machine learning models in production environments with high throughput and low latency requirements.

Key topics covered:
- Model serving architectures
- Optimization techniques for inference
- Scaling strategies
- Monitoring and observability
- Trade-offs between throughput and latency

Building production ML systems requires careful consideration of infrastructure, model optimization, and operational practices to ensure reliable, fast predictions at scale.`,
    date: "2019-05-28",
    tags: ["Demo"],
    authors: ["Divyanshu Goyal"]
  },
  {
    id: "hive-jdbc",
    title: "Hive-JDBC Storage Handler",
    summary: "Real time data import from Relational databases into HDFS/S3 and create a Hive table against it.",
    content: `The Hive-JDBC Storage Handler enables real-time data import from relational databases directly into HDFS or S3, creating Hive tables on the fly.

This tool bridges the gap between traditional relational databases and big data ecosystems, allowing seamless data integration without complex ETL pipelines.

Features:
- Direct JDBC connectivity to relational databases
- Automatic schema inference
- Support for incremental data loads
- Compatible with HDFS and S3 storage
- Optimized for large-scale data transfers`,
    date: "2015-07-28",
    tags: ["Demo"],
    authors: ["Divyanshu Goyal"]
  }
];
