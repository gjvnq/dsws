import os
import time
import platform
import chromedriver_autoinstaller

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

def dsws_numpy_test():
    options = webdriver.ChromeOptions();
    # Keep the webdriver open even after the test ends
    options.add_experimental_option("detach", True);
    # Open the chromedriver in fullcreen
    options.add_argument("--start-maximized")
    # Add dsws extension to chrome
    dsws_path = os.path.abspath("./dsws_packed/dist.crx");
    options.add_extension(dsws_path);
    # Install chromedriver
    chromedriver_autoinstaller.install();
    # Check OS an chrome version
    if (platform.system() == "Darwin"):
        print("Detected OS: Mac");
    else:
        print("Detected OS: " + platform.system()) 
    print("Chrome version: " + str(chromedriver_autoinstaller.get_chrome_version()));
    # Open the chromedriver "https://www.google.com/"
    driver = webdriver.Chrome(options=options);
    driver.get("https://www.google.com/");
    time.sleep(3);
    # Open the dsws extension
    driver.get("chrome-extension://gckcmjikpngekieobeojpoambgnccldd/index.html");
    time.sleep(15);
    # Click on "About" button
    driver.switch_to.frame(driver.find_element(By.ID, "navbar"));
    driver.find_element(By.XPATH, '/html/body/navigation/ul/a[2]').click();
    driver.switch_to.default_content();
    time.sleep(15);
    # Click on "Upload" button
    driver.switch_to.frame(driver.find_element(By.ID, "navbar"));
    driver.find_element(By.ID, 'upload-button').click();
    driver.switch_to.default_content();
    time.sleep(10);
    # Input "arquivo_de_texto.txt" file example on "Upload your file"
    driver.find_element(By.ID, "file-input").send_keys(os.getcwd()+"./test_page/arquivo_de_texto.txt");
    time.sleep(10);
    # Accept incorrect file input error alert
    driver.switch_to.alert.accept();
    time.sleep(5);
    # Input "numpy.dsws" file example on "Upload your file"
    driver.find_element(By.ID, "file-input").send_keys(os.getcwd()+"./test_page/numpy.dsws");
    time.sleep(15);
    # Scroll the iframe down to the bottom
    driver.switch_to.frame(driver.find_element(By.ID, "main-iframe"));
    driver.execute_script("window.scrollTo(100, document.body.scrollHeight);");
    time.sleep(5);
    # Click inside the iframe, on "NumPy user guide"
    driver.find_element(By.PARTIAL_LINK_TEXT, 'NumPy user guide').click();
    time.sleep(1);
    # Scroll the iframe down a little
    driver.execute_script("window.scrollTo(100, document.body.scrollHeight/7);");
    time.sleep(5);
    # Click inside the iframe, on "Indexing on ndarrays"
    driver.find_element(By.PARTIAL_LINK_TEXT, 'Indexing on ndarrays').click();
    time.sleep(1);
    # Scroll the iframe down a little
    driver.execute_script("window.scrollTo(100, document.body.scrollHeight/30);");
    time.sleep(10);
    # Scroll the iframe up to the top
    driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.CONTROL + Keys.HOME);
    time.sleep(1);
    # Click on the "url-bar", on the "<-" previous page button
    driver.switch_to.default_content();
    driver.find_element(By.ID, 'back-button').click();
    time.sleep(1);
    # Scroll the iframe up to the top
    driver.switch_to.frame(driver.find_element(By.ID, "main-iframe"));
    driver.execute_script("window.scrollTo(0, document.body.scrollTop);")
    driver.switch_to.default_content();
    time.sleep(5);
    # Click on the "url-bar", on the "<-" previous page button
    driver.find_element(By.ID, 'back-button').click();
    time.sleep(1);
    # Scroll the iframe up to the top
    driver.switch_to.frame(driver.find_element(By.ID, "main-iframe"));
    driver.execute_script("window.scrollTo(0, document.body.scrollTop);")
    driver.switch_to.default_content();
    time.sleep(5);
    # Return to the main screen by clicking on the "Upload" button
    driver.switch_to.frame(driver.find_element(By.ID, "navbar"));
    driver.find_element(By.ID, 'upload-button').click();
    driver.switch_to.default_content();
# Execute selenium test
dsws_numpy_test();
