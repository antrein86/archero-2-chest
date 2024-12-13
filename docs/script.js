class ChestGame {
    constructor() {
        this.stats = {
            chestsOpened: 0,
            keysFound: 0,
            rarityUpgradesFound: 0,
            contentUpgradesFound: 0
        };
        
        this.currentGame = {
            keys: 0,
            rarityUpgrades: 0,
            contentUpgrades: 0,
            revealedCells: 0
        };

        this.rarityLevels = ['silver', 'gold', 'legendary'];
        this.currentRarityIndex = 0;
        this.contentEnhanceLevel = 0;
        
        this.initializeElements();
        this.setupEventListeners();
        this.distributeResources();
        this.updateUI();
    }

    initializeElements() {
        this.cells = Array.from(document.querySelectorAll('.cell'));
        this.chest = document.querySelector('.chest');
        this.restartButton = document.getElementById('restart');
        this.counters = {
            keys: document.querySelector('.counter.keys'),
            rarity: document.querySelector('.counter.rarity'),
            content: document.querySelector('.counter.content')
        };
        this.statsElements = {
            chestsOpened: document.getElementById('chests-opened'),
            totalKeys: document.getElementById('total-keys'),
            totalRarity: document.getElementById('total-rarity'),
            totalContent: document.getElementById('total-content')
        };
    }

    setupEventListeners() {
        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });
        this.restartButton.addEventListener('click', () => this.resetGame());
    }

    distributeResources() {
        // Reset cells
        this.cells.forEach(cell => {
            cell.className = 'cell';
            cell.removeAttribute('data-resource');
        });

        // Ensure at least 2 keys
        const cellIndices = Array.from({ length: 9 }, (_, i) => i);
        this.shuffle(cellIndices);

        // Place 2 guaranteed keys
        for (let i = 0; i < 2; i++) {
            const index = cellIndices[i];
            this.cells[index].setAttribute('data-resource', 'key');
        }

        // Distribute remaining resources with weighted probability
        for (let i = 2; i < 9; i++) {
            const index = cellIndices[i];
            const random = Math.random();
            
            // 35% chance for keys (reduced from 50%)
            // 32.5% for rarity and 32.5% for content (increased from 25% each)
            if (random < 0.35) {
                this.cells[index].setAttribute('data-resource', 'key');
            } else if (random < 0.675) { // 0.35 + 0.325
                this.cells[index].setAttribute('data-resource', 'rarity');
            } else {
                this.cells[index].setAttribute('data-resource', 'content');
            }
        }
    }

    handleCellClick(cell) {
        if (cell.classList.contains('revealed')) return;

        cell.classList.add('revealed');
        this.currentGame.revealedCells++;

        const resource = cell.getAttribute('data-resource');
        this.collectResource(resource);
        this.updateUI();

        if (this.currentGame.keys >= 2) {
            this.openChest();
        }
    }

    collectResource(resource) {
        switch (resource) {
            case 'key':
                this.currentGame.keys++;
                this.stats.keysFound++;
                break;
            case 'rarity':
                this.currentGame.rarityUpgrades++;
                this.stats.rarityUpgradesFound++;
                if (this.currentGame.rarityUpgrades >= 2 && this.currentRarityIndex < this.rarityLevels.length - 1) {
                    this.currentGame.rarityUpgrades = 0;
                    this.currentRarityIndex++;
                }
                break;
            case 'content':
                this.currentGame.contentUpgrades++;
                this.stats.contentUpgradesFound++;
                if (this.currentGame.contentUpgrades >= 2) {
                    this.currentGame.contentUpgrades = 0;
                    this.contentEnhanceLevel++;
                }
                break;
        }
    }

    updateUI() {
        // Update counters
        this.counters.keys.textContent = `Keys: ${this.currentGame.keys}/2`;
        this.counters.rarity.textContent = `Rarity Upgrades: ${this.currentGame.rarityUpgrades}/2`;
        this.counters.content.textContent = `Content Upgrades: ${this.currentGame.contentUpgrades}/2`;

        // Update chest appearance
        this.chest.className = 'chest ' + this.rarityLevels[this.currentRarityIndex];
        if (this.contentEnhanceLevel > 0) {
            this.chest.classList.add('enhanced');
        }

        // Update statistics
        this.statsElements.chestsOpened.textContent = this.stats.chestsOpened;
        this.statsElements.totalKeys.textContent = this.stats.keysFound;
        this.statsElements.totalRarity.textContent = this.stats.rarityUpgradesFound;
        this.statsElements.totalContent.textContent = this.stats.contentUpgradesFound;
    }

    openChest() {
        this.chest.classList.add('opened');
        this.stats.chestsOpened++;
        this.restartButton.classList.remove('hidden');
        
        // Disable remaining cells
        this.cells.forEach(cell => {
            if (!cell.classList.contains('revealed')) {
                cell.style.pointerEvents = 'none';
            }
        });
    }

    resetGame() {
        this.currentGame = {
            keys: 0,
            rarityUpgrades: 0,
            contentUpgrades: 0,
            revealedCells: 0
        };
        
        this.currentRarityIndex = 0;
        this.contentEnhanceLevel = 0;
        
        this.chest.className = 'chest silver';
        this.restartButton.classList.add('hidden');
        
        this.cells.forEach(cell => {
            cell.style.pointerEvents = '';
        });
        
        this.distributeResources();
        this.updateUI();
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChestGame();
});
