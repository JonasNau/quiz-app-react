import { CLIENT_APPLICATION_CONFIG } from "@/app/includes/config/clientApplicationConfig";
import ClientLogger from "loglevel";

ClientLogger.setDefaultLevel(CLIENT_APPLICATION_CONFIG.LOGGING.LOG_LEVEL);

export default ClientLogger;
