var MPI = require('mpi-node')
const apiComs = () => {

    const tid = MPI.rank;

    if (tid === 0) {
        MPI.recv('found', (msg) => {
            
        })

        MPI.recv('not-found', (msg) => {
            
        })
        }
    } else {

    }
}


module.exports = { apiComs };