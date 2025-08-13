

#Build and Run
Run commmands in the order below to build and run app

npm install
npm run dev
Open http://localhost:3000 with your browser to see the result.



#Docker 
Install docker desktop. Run these commands to dockerize and run local container 

docker build -t power-tracker . 
docker run -p 3000:3000 power-tracker