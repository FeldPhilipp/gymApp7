#!/bin/bash

# GymApp Database Sync Script
# Synchronisiert lokale MySQL mit vServer MySQL
# 
# Verwendung:
#   ./db_sync.sh local-to-remote
#   ./db_sync.sh remote-to-local
#   ./db_sync.sh compare

set -e

# Konfiguration
LOCAL_HOST="127.0.0.1"
LOCAL_USER="tiegelapp"
LOCAL_PASS="oAS\$pszu#vuG3j03"
LOCAL_DB="tiegel"
LOCAL_DOCKER_CONTAINER="tiegel-mysql"

REMOTE_HOST="159.195.25.151"
REMOTE_USER="root"
REMOTE_DB="tiegel"

LOCAL_BACKUP="./db_sync_local_backup.sql"
REMOTE_BACKUP="/tmp/gymapp_remote_backup.sql"

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 GymApp Database Synchronization${NC}"
echo "=================================="

# Funktion: Export lokal
export_local() {
    echo -e "${YELLOW}📥 Exportiere lokale Datenbank...${NC}"
    
    # Überprüfe ob Docker Container läuft
    if ! docker ps | grep -q $LOCAL_DOCKER_CONTAINER; then
        echo -e "${RED}❌ Fehler: Docker Container '$LOCAL_DOCKER_CONTAINER' ist nicht gestartet!${NC}"
        echo -e "${BLUE}Starte mit:${NC}"
        echo "  docker start $LOCAL_DOCKER_CONTAINER"
        exit 1
    fi
    
    docker exec $LOCAL_DOCKER_CONTAINER mysqldump -u $LOCAL_USER -p$LOCAL_PASS $LOCAL_DB > $LOCAL_BACKUP
    echo -e "${GREEN}✅ Local DB exportiert: $LOCAL_BACKUP${NC}"
}

# Funktion: Export remote
export_remote() {
    echo -e "${YELLOW}📥 Exportiere Remote Datenbank (vServer)...${NC}"
    ssh root@$REMOTE_HOST "mysqldump -u $REMOTE_USER $REMOTE_DB" > $REMOTE_BACKUP
    echo -e "${GREEN}✅ Remote DB exportiert: $REMOTE_BACKUP${NC}"
}

# Funktion: Import lokal
import_local() {
    echo -e "${YELLOW}📤 Importiere in lokale Datenbank...${NC}"
    
    # Überprüfe ob Docker Container läuft
    if ! docker ps | grep -q $LOCAL_DOCKER_CONTAINER; then
        echo -e "${RED}❌ Fehler: Docker Container '$LOCAL_DOCKER_CONTAINER' ist nicht gestartet!${NC}"
        exit 1
    fi
    
    docker exec -i $LOCAL_DOCKER_CONTAINER mysql -u $LOCAL_USER -p$LOCAL_PASS $LOCAL_DB < $REMOTE_BACKUP
    echo -e "${GREEN}✅ Remote DB in lokal importiert${NC}"
}

# Funktion: Import remote
import_remote() {
    echo -e "${YELLOW}📤 Importiere in Remote Datenbank (vServer)...${NC}"
    scp $LOCAL_BACKUP root@$REMOTE_HOST:/tmp/
    ssh root@$REMOTE_HOST "mysql -u $REMOTE_USER $REMOTE_DB < /tmp/db_sync_local_backup.sql"
    ssh root@$REMOTE_HOST "rm /tmp/db_sync_local_backup.sql"
    echo -e "${GREEN}✅ Lokale DB in Remote importiert${NC}"
}

# Funktion: Vergleich
compare_dbs() {
    echo -e "${YELLOW}🔍 Vergleiche Datenbanken...${NC}"
    
    export_local
    export_remote
    
    echo -e "\n${YELLOW}Dateigröße:${NC}"
    echo "Local:  $(du -h $LOCAL_BACKUP | cut -f1)"
    echo "Remote: $(du -h $REMOTE_BACKUP | cut -f1)"
    
    echo -e "\n${YELLOW}Tabellenanzahl:${NC}"
    local_tables=$(grep "CREATE TABLE" $LOCAL_BACKUP | wc -l)
    remote_tables=$(grep "CREATE TABLE" $REMOTE_BACKUP | wc -l)
    echo "Local:  $local_tables Tabellen"
    echo "Remote: $remote_tables Tabellen"
    
    if diff -q $LOCAL_BACKUP $REMOTE_BACKUP > /dev/null 2>&1; then
        echo -e "\n${GREEN}✅ Datenbanken sind identisch${NC}"
    else
        echo -e "\n${RED}❌ Unterschiede gefunden${NC}"
        echo "Unterschiedliche Zeilen (erste 20):"
        diff $LOCAL_BACKUP $REMOTE_BACKUP | head -20 || true
    fi
}

# Hauptlogik
case "${1:-help}" in
    local-to-remote)
        echo -e "${BLUE}→ Synchronisiere: Lokal zu Remote${NC}"
        export_local
        import_remote
        echo -e "\n${GREEN}✅ Erfolgreich: Lokale DB → Remote${NC}"
        ;;
    remote-to-local)
        echo -e "${BLUE}→ Synchronisiere: Remote zu Lokal${NC}"
        export_remote
        import_local
        echo -e "\n${GREEN}✅ Erfolgreich: Remote DB → Lokal${NC}"
        ;;
    compare)
        compare_dbs
        ;;
    *)
        echo -e "${YELLOW}Verwendung:${NC}"
        echo "  $0 local-to-remote   - Lokal → Remote synchen (lokal exportieren, remote importieren)"
        echo "  $0 remote-to-local   - Remote → Lokal synchen (remote exportieren, lokal importieren)"
        echo "  $0 compare           - Datenbanken vergleichen"
        echo ""
        echo -e "${YELLOW}Voraussetzungen:${NC}"
        echo "  • Docker Container '$LOCAL_DOCKER_CONTAINER' muss laufen"
        echo "  • SSH-Zugang zu root@$REMOTE_HOST"
        echo "  • MySQL-Client lokal und auf vServer installiert"
        echo ""
        echo -e "${YELLOW}Beispiele:${NC}"
        echo "  # Remote-DB herunterladen zum Testen"
        echo "  $0 remote-to-local"
        echo ""
        echo "  # Nach lokalen Änderungen hochladen"
        echo "  $0 local-to-remote"
        echo ""
        echo "  # Unterschiede prüfen"
        echo "  $0 compare"
        exit 1
        ;;
esac

