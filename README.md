# StackUp FE Dev Assessment
> Weather app using MetaWeather API

## Step 1: Download XAMPP
For this assessment, I have use XAMPP.
Go to: https://www.apachefriends.org/index.html and click the download for your OS.

### For Mac
Download Universal Binary, open DMG image and drag the XAMPP folder into Applications

### For Windows
Choose and download the relevant Installer version.
Click installer.exe and follow the install process. You will be prompted to install Apache + MySQL, these are required.

## Step 2: Start Apache and MySQL
If you have a firewall enabled, you may need to grant permission for these services to run.
Once you've started Apache and MySQL, open your browser and type `localhost` and you should see the XAMPP splash screen.

## Step 3: Put Files in Correct Directory
To use this application, the files need to be in the proper directory. All websites accessed through `localhost` need to be stored within the /htdocs folder within XAMPP.
To achieve this, navigate to `C:\Users\USER\xampp\htdocs` then create a folder called weatherwidget (or anything) and put the relevant files in. The structure I used was:
` * weatherwidget
    *css
      *styles.css
    *js
      *app.js
    *index.html
`
