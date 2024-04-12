const db = require("../../models");
const Features = db.feature;

const createFeatures = (req,res) => {


    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }
   

    const feature = {
        feature_name:req.body.feature_name,
        description:req.body.description,
        is_active:req.body.is_active,
        organisation_id:req.body.organisation_id
    }

    Features.findOne({ where: { feature_name: feature.feature_name,organisation_id:feature.organisation_id } }).then(featureExists => {
        if(!featureExists) {
            Features.create(feature).then(data => {
                let featureData = {
                    feature_name:data.feature_name,
                }
                res.status(200).send({
                    featureData,
                    message:   `${featureData.feature_name} feature is Created Successfully`
                })
            }).catch(err => {
                console.log(err)
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while creating the feature."
                }); 
            })
        } else {
                res.status(403).send({
                    message: "Feature already exists"
                })
            }
    })
    
    


};

const getAllFeatures = (req,res) => {
    Features.findAll().then(data => {
        res.send(data);
    }) .catch((err) => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving jobs.",
        });
      });

};

const getAllFeaturesByOrganisationId = (req,res) => {
    const organisationId = req.params.id;

    Features.findAll({ where: {organisation_id: organisationId } })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving jobs.",
      });
    });
}

const getFeatureById = (req, res) => {
    const id = req.params.id;
  
    Features.findByPk(id)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message: "Error retrieving Feature with id=" + id,
        });
      });
};
  
const updateFeatureById  = (req,res) => {
    const id = req.params.id;
    Features.update(req.body,{id:id}).then(num => {
         if(!num){
            res.send({
                message: "Feature was updated successfully.",
              });
         } else {
            res.send({
                message: `Cannot update Feature with id=${id}. Maybe Job was not found or req.body is empty!`,
            });
         }
    }) .catch((err) => {
        res.status(500).send({
          message: "Error updating Feature with id=" + id,
        });
      });
}

const findFeature = (req,res) => {

}


module.exports ={
    createFeatures,
    getAllFeatures,
    getFeatureById,
    getAllFeaturesByOrganisationId,
    updateFeatureById,
    findFeature
}