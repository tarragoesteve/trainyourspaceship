
function transform_state(active_player, player_positions, bullets) {

    //define custom sort function
    function sortfunction(a, b){
        return (a.x*a.x + a.y *a.y) - (b.x*b.x + b.y*b.y);
    }

    var player1 = player_positions[active_player];
    var player2;

    var i = 0;
    for(player_position in player_positions) {
        if(i > 1) break;

        if(player_position != active_player) player2 = player_positions[player2];
    }

    var new_state = [player1.d%2, player1.d/2];

    //addd player2 relative positions
    new_state.push(player1.x - player2.x);
    new_state.push(player1.y - player2.y);

    //add player2 direction
    new_state.push(player2.d%2);
    new_state.push(player2.d/2);

    if(bullets.lenght > 1) {

        //get bullets
        bullets.sort(sortfunction);

        //add bullet1
        new_state.push(1);
        new_state.push(bullets[0].x);
        new_state.push(bullets[0].y);
        new_state.push(bullets[0].d%2);
        new_state.push(bullets[0].d/2);

        //add bullet2
        new_state.push(1);
        new_state.push(bullets[1].x);
        new_state.push(bullets[1].y);
        new_state.push(bullets[1].d%2);
        new_state.push(bullets[1].d/2);
    }
    else if(bullets.length == 1) {
        //add bullet1
        new_state.push(1);
        new_state.push(bullets[0].x);
        new_state.push(bullets[0].y);
        new_state.push(bullets[0].d%2);
        new_state.push(bullets[0].d/2);

        //add bullet2
        new_state.push(0);
        new_state.push(0);
        new_state.push(0);
        new_state.push(-1);
        new_state.push(-1);
    }
    else {
        //add bullet1
        new_state.push(0);
        new_state.push(0);
        new_state.push(0);
        new_state.push(-1);
        new_state.push(-1);

        //add bullet2
        new_state.push(0);
        new_state.push(0);
        new_state.push(0);
        new_state.push(-1);
        new_state.push(-1);
    }

    return new_state;
    
}

exports.transform_state = transform_state;