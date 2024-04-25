# Game of Life Hand Painting

An open-source foundation for creating interactive Game of Life simulations using hand-tracking.

[![Project Demo](life-hand-painting-demo.gif)](life-hand-painting-demo.gif) 

**Features**

*   Hand-gesture controlled spawning of cells onto the Game of Life grid. 
*   Implementation of classic Conway's Game of Life rules.
*   Customizable cell cluster spawning with adjustable density and aliveness probabilities.
*   Integration with a live video feed for interactive overlay.

**Technologies**

*   Handpose 
*   p5.js

**Setup (Apache)**

**Prerequisites:**
*   An Apache web server configured to serve files from a designated directory.
*   Git installed

**Instructions**

1.  **Clone the Repository:**  Using administrator permissions, clone this repository into your Apache server's web-accessible directory (typically `/Library/WebServer/Documents` on macOS):

    ```bash
    sudo git clone [https://github.com/your-username/game-of-life-hand-painting](https://github.com/your-username/game-of-life-hand-painting) /Library/WebServer/Documents
    ``` 

2.  **Install Dependencies (if applicable):**  If the project includes server-side dependencies, navigate to the project directory and install them using npm:

    ```bash
    cd /Library/WebServer/Documents/game-of-life-hand-painting
    sudo npm install 
    ```

3.  **Start the Apache Server:**  Start your Apache server:

    ```bash
     sudo apachectl start
    ```

4.  **Access the Project:** Open a web browser and navigate to `http://localhost/game-of-life-hand-painting` (or the appropriate URL based on your server configuration).

5.  **Stop the Apache Server:** To stop the server, use: 

    ```bash
    sudo apachectl stop
    ``` 

**Note:**  Setup instructions might differ slightly for Windows or Linux-based Apache servers.  Refer to the Apache documentation for your specific operating system. 
