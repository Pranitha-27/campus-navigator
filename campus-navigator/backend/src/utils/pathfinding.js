// A* Pathfinding Algorithm for indoor navigation

class PathFinder {
  constructor(locations) {
    this.locations = locations;
    this.graph = this.buildGraph(locations);
  }

  // Build graph from locations
  buildGraph(locations) {
    const graph = {};
    
    locations.forEach(location => {
      graph[location._id.toString()] = {
        ...location.toObject(),
        neighbors: location.connectedTo.map(conn => ({
          id: conn.locationId.toString(),
          distance: conn.distance,
          pathType: conn.pathType
        }))
      };
    });
    
    return graph;
  }

  // Calculate distance between two points (Euclidean distance)
  calculateDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const dz = point2.z - point1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // A* pathfinding algorithm
  findPath(startId, endId) {
    const start = this.graph[startId];
    const end = this.graph[endId];

    if (!start || !end) {
      return { path: [], distance: 0, error: 'Start or end location not found' };
    }

    const openSet = [startId];
    const cameFrom = {};
    const gScore = { [startId]: 0 };
    const fScore = { 
      [startId]: this.calculateDistance(start.coordinates, end.coordinates) 
    };

    while (openSet.length > 0) {
      // Get node with lowest fScore
      let current = openSet.reduce((min, id) => 
        (fScore[id] || Infinity) < (fScore[min] || Infinity) ? id : min
      );

      // Reached destination
      if (current === endId) {
        return this.reconstructPath(cameFrom, current);
      }

      // Remove current from openSet
      openSet.splice(openSet.indexOf(current), 1);

      // Check all neighbors
      const currentNode = this.graph[current];
      if (!currentNode.neighbors) continue;

      currentNode.neighbors.forEach(neighbor => {
        const neighborId = neighbor.id;
        const tentativeGScore = gScore[current] + neighbor.distance;

        if (!gScore[neighborId] || tentativeGScore < gScore[neighborId]) {
          cameFrom[neighborId] = current;
          gScore[neighborId] = tentativeGScore;
          fScore[neighborId] = tentativeGScore + 
            this.calculateDistance(
              this.graph[neighborId].coordinates,
              end.coordinates
            );

          if (!openSet.includes(neighborId)) {
            openSet.push(neighborId);
          }
        }
      });
    }

    return { path: [], distance: 0, error: 'No path found' };
  }

  // Reconstruct path from A* result
  reconstructPath(cameFrom, current) {
    const path = [current];
    let totalDistance = 0;

    while (cameFrom[current]) {
      const prev = cameFrom[current];
      path.unshift(prev);
      
      // Calculate distance for this segment
      const prevNode = this.graph[prev];
      const neighbor = prevNode.neighbors.find(n => n.id === current);
      if (neighbor) {
        totalDistance += neighbor.distance;
      }
      
      current = prev;
    }

    // Get full location details for path
    const detailedPath = path.map(id => {
      const loc = this.graph[id];
      return {
        id: loc._id,
        name: loc.name,
        type: loc.type,
        building: loc.building,
        floor: loc.floor,
        roomNumber: loc.roomNumber,
        coordinates: loc.coordinates
      };
    });

    return {
      path: detailedPath,
      distance: Math.round(totalDistance * 10) / 10, // Round to 1 decimal
      steps: this.generateDirections(detailedPath)
    };
  }

  // Generate human-readable directions
  generateDirections(path) {
    if (path.length < 2) return [];

    const directions = [];
    
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];
      
      let instruction = '';
      
      // Floor change
      if (current.floor !== next.floor) {
        const direction = next.floor > current.floor ? 'up' : 'down';
        instruction = `Go ${direction} to Floor ${next.floor}`;
      } else {
        // Same floor movement
        const distance = this.calculateDistance(
          current.coordinates,
          next.coordinates
        );
        instruction = `Walk ${Math.round(distance)}m to ${next.name}`;
      }
      
      directions.push({
        from: current.name,
        to: next.name,
        instruction,
        distance: Math.round(
          this.calculateDistance(current.coordinates, next.coordinates)
        )
      });
    }
    
    return directions;
  }
}

module.exports = PathFinder;