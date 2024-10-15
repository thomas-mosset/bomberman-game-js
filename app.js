const board_size = 10;
const game_board = document.querySelector('.game-board'); 
const cells = [];
let game_over = false; // Flag to stop the game when the player loses
let player_position = { row: 0, column: 0 };
let bombs = [];
let bomb_placing_interval; // Store the interval for bomb placement
let game_over_message, play_again_button; // Store game over message and button

// Create game board
function create_board() {
    game_board.innerHTML = ''; // Clear any previous game board
    for (let row = 0; row < board_size; row++) {
        for (let column = 0; column < board_size; column++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            // The dataset property is used to access custom data attributes that are added to HTML elements. These data attributes allow you to store extra information on elements that can be easily accessed and manipulated with JavaScript.
            // Each cell of the game board is being assigned two data attributes: data-row and data-column.
            cell.dataset.row = row;
            cell.dataset.column = column;
            game_board.appendChild(cell);
            cells.push(cell);
        }
    }
}

// Draw the player on the board
function draw_player() {
    if (game_over) return; // Don't update the board if game is over
    clear_board();
    const player_cell = cells[player_position.row * board_size + player_position.column];
    player_cell.classList.add('player');
    check_collision(player_cell); // Check if player collided with a bomb or explosion
}

// Clear the board except for bombs and explosions
function clear_board() {
    cells.forEach(cell => {
        cell.classList.remove('player');
        if (!cell.classList.contains('bomb') && !cell.classList.contains('explosion')) {
            cell.innerHTML = '';
        }
    });
}

// Handle player movement
function move_player(row_change, column_change) {
    if (game_over) return; // Stop player movement if game is over
    const new_row = player_position.row + row_change;
    const new_column = player_position.column + column_change;
    if (new_row >= 0 && new_row < board_size && new_column >= 0 && new_column < board_size) {
        player_position.row = new_row;
        player_position.column = new_column;
        draw_player();
    }
}

// Generate random position
function get_random_position() {
    const random_row = Math.floor(Math.random() * board_size);
    const random_column = Math.floor(Math.random() * board_size);
    return { row: random_row, column: random_column };
}

// Handle placing bombs at a random position
function place_bomb() {
    if (game_over) return; // Don't place bombs if the game is over
    const bomb_position = get_random_position();
    const bomb_cell = cells[bomb_position.row * board_size + bomb_position.column];

    if (!bomb_cell.classList.contains('bomb')) { // Prevent placing multiple bombs in the same spot
        bomb_cell.classList.add('bomb');
        bombs.push(bomb_position);

        // Bomb explosion after 3 seconds
        setTimeout(() => {
            explode_bomb(bomb_position);
        }, 3000);
    }
}

// Handle bomb explosion
function explode_bomb(bomb_position) {
    const bomb_cell = cells[bomb_position.row * board_size + bomb_position.column];
    bomb_cell.classList.remove('bomb');
    bomb_cell.classList.add('explosion');

    const explosion_radius = [
        { row: 0, column: 0 },    // Center of explosion
        { row: -1, column: 0 },   // Up
        { row: 1, column: 0 },    // Down
        { row: 0, column: -1 },   // Left
        { row: 0, column: 1 }     // Right
    ];

    explosion_radius.forEach(offset => {
        const explosion_row = bomb_position.row + offset.row;
        const explosion_column = bomb_position.column + offset.column;
        if (explosion_row >= 0 && explosion_row < board_size && explosion_column >= 0 && explosion_column < board_size) {
            const explosion_cell = cells[explosion_row * board_size + explosion_column];
            explosion_cell.classList.add('explosion');
        }
    });

    // Check if the player is in the explosion area
    check_collision();

    // Clear explosion after 0.5 seconds
    setTimeout(() => {
        clear_explosion(bomb_position);
    }, 500);
}

// Clear the explosion
function clear_explosion(bomb_position) {
    const bomb_cell = cells[bomb_position.row * board_size + bomb_position.column];
    bomb_cell.classList.remove('explosion');

    const explosion_radius = [
        { row: 0, column: 0 },
        { row: -1, column: 0 },
        { row: 1, column: 0 },
        { row: 0, column: -1 },
        { row: 0, column: 1 }
    ];

    explosion_radius.forEach(offset => {
        const explosion_row = bomb_position.row + offset.row;
        const explosion_column = bomb_position.column + offset.column;
        if (explosion_row >= 0 && explosion_row < board_size && explosion_column >= 0 && explosion_column < board_size) {
            const explosion_cell = cells[explosion_row * board_size + explosion_column];
            explosion_cell.classList.remove('explosion');
        }
    });
}

// Check if the player collided with an explosion (not a bomb)
function check_collision() {
    const player_cell = cells[player_position.row * board_size + player_position.column];
    if (player_cell.classList.contains('explosion')) {  // Check only for explosion, not bomb
        game_over = true;
        end_game();
    }
}

// End the game, stop everything and show "You Lose" message
function end_game() {
    // Stop bomb placement
    clearInterval(bomb_placing_interval);

    // Display "You Lose" message
    game_over_message = document.createElement('div');
    game_over_message.textContent = "You Lose!";
    game_over_message.style.fontSize = "40px";
    game_over_message.style.color = "red";
    game_over_message.style.position = "absolute";
    game_over_message.style.top = "40%";
    game_over_message.style.left = "50%";
    game_over_message.style.transform = "translate(-50%, -50%)";
    document.body.appendChild(game_over_message);

    // Create "Play Again?" button
    play_again_button = document.createElement('button');
    play_again_button.textContent = "Play Again?";
    play_again_button.style.fontSize = "20px";
    play_again_button.style.position = "absolute";
    play_again_button.style.top = "60%";
    play_again_button.style.left = "50%";
    play_again_button.style.transform = "translate(-50%, -50%)";
    play_again_button.addEventListener('click', reset_game);
    document.body.appendChild(play_again_button);
}

// Reset the game when "Play Again?" is clicked
function reset_game() {
    console.log("reset_game");

    game_over = false;
    player_position = { row: 0, column: 0 };
    bombs = [];
    
    // Remove game over message and button
    if (game_over_message) {
        game_over_message.remove();
        game_over_message = null; // Ensure to clear reference
    }

    if (play_again_button) {
        play_again_button.remove();
        play_again_button = null; // Ensure to clear reference
    }

    // Clear the board and restart game
    create_board();
    draw_player();

    // Restart bomb placement with 2000 ms interval
    bomb_placing_interval = setInterval(() => {
        place_bomb();
    }, 2000); // Set to 2000 ms for bomb placement
}

// Handle keypress events for movement and bomb placement
window.addEventListener('keydown', (e) => {
    if (game_over) return; // Don't allow movement if game is over
    switch (e.key) {
        case 'ArrowUp':
            move_player(-1, 0);
            break;
        case 'ArrowDown':
            move_player(1, 0);
            break;
        case 'ArrowLeft':
            move_player(0, -1);
            break;
        case 'ArrowRight':
            move_player(0, 1);
            break;
        case ' ':
            place_bomb();
            break;
    }
});

// Automatically place a bomb at a random position every 5 seconds
bomb_placing_interval = setInterval(() => {
    place_bomb();
}, 2000);

// Initialize the game
create_board();
draw_player();
