-- roblox-ts compatible wrapper for @quenty/baseobject.
-- Adds :constructor() so TS classes can `extends BaseObject` with super().
-- All behavior is delegated to the real BaseObject — nothing is reimplemented.

local require = require(script.Parent.loader).load(script)

local RealBaseObject = require("BaseObject")

local BaseObject = setmetatable({}, { __index = RealBaseObject })
BaseObject.ClassName = "BaseObject"
BaseObject.__index = BaseObject

function BaseObject.new(...)
	local self = setmetatable({}, BaseObject)
	return self:constructor(...) or self
end

function BaseObject:constructor(obj)
	local base = RealBaseObject.new(obj)
	for k, v in base do
		self[k] = v
	end
end

return BaseObject
