// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AIModelMarketplace {
    struct Model {
        string name;
        string description;
        uint256 price;
        address payable creator;
        uint256 ratingSum;
        uint256 ratingCount;
    }

    mapping(uint256 => Model) public models;
    uint256 public modelCount;

    // 事件
    event ModelListed(uint256 modelId, string name, uint256 price, address creator);
    event ModelPurchased(uint256 modelId, address buyer);
    event ModelRated(uint256 modelId, uint8 rating, address rater);

    // 列出模型
    function listModel(string memory name, string memory description, uint256 price) public {
        require(price > 0, "价格必须大于0");

        modelCount++;
        models[modelCount] = Model(name, description, price, payable(msg.sender), 0, 0);
        emit ModelListed(modelCount, name, price, msg.sender);
    }

    // 购买模型
    function purchaseModel(uint256 modelId) public payable {
        Model storage model = models[modelId];
        require(model.price > 0, "模型不存在");
        require(msg.value >= model.price, "支付金额不足");

        model.creator.transfer(msg.value);
        emit ModelPurchased(modelId, msg.sender);
    }

    // 评价模型
    function rateModel(uint256 modelId, uint8 rating) public {
        require(rating > 0 && rating <= 5, "评分必须在1到5之间");
        Model storage model = models[modelId];

        model.ratingSum += rating;
        model.ratingCount++;
        emit ModelRated(modelId, rating, msg.sender);
    }

    // 获取模型详情
    function getModelDetails(uint256 modelId) public view returns (string memory, string memory, uint256, address, uint256) {
        Model storage model = models[modelId];
        require(model.price > 0, "模型不存在");

        uint256 averageRating = model.ratingCount > 0 ? model.ratingSum / model.ratingCount : 0;
        return (model.name, model.description, model.price, model.creator, averageRating);
    }

    // 提现
    function withdrawFunds() public {
        payable(msg.sender).transfer(address(this).balance);
    }
}
