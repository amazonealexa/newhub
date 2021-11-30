! function(factory) {
    "function" == typeof define && define.amd ? define(["jquery"], factory) : "object" == typeof exports ? factory(require("jquery")) : factory(jQuery)
}((function($) {
    var defaults = {
        element: "body",
        position: null,
        type: "info",
        allow_dismiss: !0,
        allow_duplicates: !0,
        newest_on_top: !1,
        showProgressbar: !1,
        placement: {
            from: "top",
            align: "right"
        },
        offset: 20,
        spacing: 10,
        z_index: 1060,
        delay: 5e3,
        timer: 1e3,
        url_target: "_blank",
        mouse_over: null,
        animate: {
            enter: "animated fadeInDown",
            exit: "animated fadeOutUp"
        },
        onShow: null,
        onShown: null,
        onClose: null,
        onClosed: null,
        onClick: null,
        icon_type: "class",
        template: '<div data-notify="container" class="col-xs-11 col-sm-4 alert alert-{0}" role="alert"><button type="button" aria-hidden="true" class="close" data-notify="dismiss"><i class="tim-icons icon-simple-remove"></i></button><span data-notify="icon"></span> <span data-notify="title">{1}</span> <span data-notify="message">{2}</span><div class="progress" data-notify="progressbar"><div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div></div><a href="{3}" target="{4}" data-notify="url"></a></div>'
    };

    function isDuplicateNotification(notification) {
        var isDupe = !1;
        return $('[data-notify="container"]').each((function(i, el) {
            var $el = $(el),
                title = $el.find('[data-notify="title"]').html().trim(),
                message = $el.find('[data-notify="message"]').html().trim(),
                isSameTitle = title === $("<div>" + notification.settings.content.title + "</div>").html().trim(),
                isSameMsg = message === $("<div>" + notification.settings.content.message + "</div>").html().trim(),
                isSameType = $el.hasClass("alert-" + notification.settings.type);
            return isSameTitle && isSameMsg && isSameType && (isDupe = !0), !isDupe
        })), isDupe
    }

    function Notify(element, content, options) {
        var contentObj = {
            content: {
                message: "object" == typeof content ? content.message : content,
                title: content.title ? content.title : "",
                icon: content.icon ? content.icon : "",
                url: content.url ? content.url : "#",
                target: content.target ? content.target : "-"
            }
        };
        options = $.extend(!0, {}, contentObj, options), this.settings = $.extend(!0, {}, defaults, options), this._defaults = defaults, "-" === this.settings.content.target && (this.settings.content.target = this.settings.url_target), this.animations = {
            start: "webkitAnimationStart oanimationstart MSAnimationStart animationstart",
            end: "webkitAnimationEnd oanimationend MSAnimationEnd animationend"
        }, "number" == typeof this.settings.offset && (this.settings.offset = {
            x: this.settings.offset,
            y: this.settings.offset
        }), (this.settings.allow_duplicates || !this.settings.allow_duplicates && !isDuplicateNotification(this)) && this.init()
    }
    String.format = function() {
        var args = arguments,
            str = arguments[0];
        return str.replace(/(\{\{\d\}\}|\{\d\})/g, (function(str) {
            if ("{{" === str.substring(0, 2)) return str;
            var num = parseInt(str.match(/\d/)[0]);
            return args[num + 1]
        }))
    }, $.extend(Notify.prototype, {
        init: function() {
            var self = this;
            this.buildNotify(), this.settings.content.icon && this.setIcon(), "#" != this.settings.content.url && this.styleURL(), this.styleDismiss(), this.placement(), this.bind(), this.notify = {
                $ele: this.$ele,
                update: function(command, update) {
                    var commands = {};
                    for (var cmd in "string" == typeof command ? commands[command] = update : commands = command, commands) switch (cmd) {
                        case "type":
                            this.$ele.removeClass("alert-" + self.settings.type), this.$ele.find('[data-notify="progressbar"] > .progress-bar').removeClass("progress-bar-" + self.settings.type), self.settings.type = commands[cmd], this.$ele.addClass("alert-" + commands[cmd]).find('[data-notify="progressbar"] > .progress-bar').addClass("progress-bar-" + commands[cmd]);
                            break;
                        case "icon":
                            var $icon = this.$ele.find('[data-notify="icon"]');
                            "class" === self.settings.icon_type.toLowerCase() ? $icon.removeClass(self.settings.content.icon).addClass(commands[cmd]) : ($icon.is("img") || $icon.find("img"), $icon.attr("src", commands[cmd])), self.settings.content.icon = commands[command];
                            break;
                        case "progress":
                            var newDelay = self.settings.delay - self.settings.delay * (commands[cmd] / 100);
                            this.$ele.data("notify-delay", newDelay), this.$ele.find('[data-notify="progressbar"] > div').attr("aria-valuenow", commands[cmd]).css("width", commands[cmd] + "%");
                            break;
                        case "url":
                            this.$ele.find('[data-notify="url"]').attr("href", commands[cmd]);
                            break;
                        case "target":
                            this.$ele.find('[data-notify="url"]').attr("target", commands[cmd]);
                            break;
                        default:
                            this.$ele.find('[data-notify="' + cmd + '"]').html(commands[cmd])
                    }
                    var posX = this.$ele.outerHeight() + parseInt(self.settings.spacing) + parseInt(self.settings.offset.y);
                    self.reposition(posX)
                },
                close: function() {
                    self.close()
                }
            }
        },
        buildNotify: function() {
            var content = this.settings.content;
            this.$ele = $(String.format(this.settings.template, this.settings.type, content.title, content.message, content.url, content.target)), this.$ele.attr("data-notify-position", this.settings.placement.from + "-" + this.settings.placement.align), this.settings.allow_dismiss || this.$ele.find('[data-notify="dismiss"]').css("display", "none"), (this.settings.delay <= 0 && !this.settings.showProgressbar || !this.settings.showProgressbar) && this.$ele.find('[data-notify="progressbar"]').remove()
        },
        setIcon: function() {
            this.$ele.addClass("alert-with-icon"), "class" === this.settings.icon_type.toLowerCase() ? this.$ele.find('[data-notify="icon"]').addClass(this.settings.content.icon) : this.$ele.find('[data-notify="icon"]').is("img") ? this.$ele.find('[data-notify="icon"]').attr("src", this.settings.content.icon) : this.$ele.find('[data-notify="icon"]').append('<img src="' + this.settings.content.icon + '" alt="Notify Icon" />')
        },
        styleDismiss: function() {
            this.$ele.find('[data-notify="dismiss"]').css({
                position: "absolute",
                right: "10px",
                top: "50%",
                marginTop: "-13px",
                zIndex: this.settings.z_index + 2
            })
        },
        styleURL: function() {
            this.$ele.find('[data-notify="url"]').css({
                backgroundImage: "url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)",
                height: "100%",
                left: 0,
                position: "absolute",
                top: 0,
                width: "100%",
                zIndex: this.settings.z_index + 1
            })
        },
        placement: function() {
            var self = this,
                offsetAmt = this.settings.offset.y,
                css = {
                    display: "inline-block",
                    margin: "0px auto",
                    position: this.settings.position ? this.settings.position : "body" === this.settings.element ? "fixed" : "absolute",
                    transition: "all .5s ease-in-out",
                    zIndex: this.settings.z_index
                },
                hasAnimation = !1,
                settings = this.settings;
            switch ($('[data-notify-position="' + this.settings.placement.from + "-" + this.settings.placement.align + '"]:not([data-closing="true"])').each((function() {
                offsetAmt = Math.max(offsetAmt, parseInt($(this).css(settings.placement.from)) + parseInt($(this).outerHeight()) + parseInt(settings.spacing))
            })), !0 === this.settings.newest_on_top && (offsetAmt = this.settings.offset.y), css[this.settings.placement.from] = offsetAmt + "px", this.settings.placement.align) {
                case "left":
                case "right":
                    css[this.settings.placement.align] = this.settings.offset.x + "px";
                    break;
                case "center":
                    css.left = 0, css.right = 0
            }
            this.$ele.css(css).addClass(this.settings.animate.enter), $.each(Array("webkit-", "moz-", "o-", "ms-", ""), (function(index, prefix) {
                self.$ele[0].style[prefix + "AnimationIterationCount"] = 1
            })), $(this.settings.element).append(this.$ele), !0 === this.settings.newest_on_top && (offsetAmt = parseInt(offsetAmt) + parseInt(this.settings.spacing) + this.$ele.outerHeight(), this.reposition(offsetAmt)), $.isFunction(self.settings.onShow) && self.settings.onShow.call(this.$ele), this.$ele.one(this.animations.start, (function() {
                hasAnimation = !0
            })).one(this.animations.end, (function() {
                self.$ele.removeClass(self.settings.animate.enter), $.isFunction(self.settings.onShown) && self.settings.onShown.call(this)
            })), setTimeout((function() {
                hasAnimation || $.isFunction(self.settings.onShown) && self.settings.onShown.call(this)
            }), 600)
        },
        bind: function() {
            var self = this;
            if (this.$ele.find('[data-notify="dismiss"]').on("click", (function() {
                    self.close()
                })), $.isFunction(self.settings.onClick) && this.$ele.on("click", (function(event) {
                    event.target != self.$ele.find('[data-notify="dismiss"]')[0] && self.settings.onClick.call(this, event)
                })), this.$ele.mouseover((function() {
                    $(this).data("data-hover", "true")
                })).mouseout((function() {
                    $(this).data("data-hover", "false")
                })), this.$ele.data("data-hover", "false"), this.settings.delay > 0) {
                self.$ele.data("notify-delay", self.settings.delay);
                var timer = setInterval((function() {
                    var delay = parseInt(self.$ele.data("notify-delay")) - self.settings.timer;
                    if ("false" === self.$ele.data("data-hover") && "pause" === self.settings.mouse_over || "pause" != self.settings.mouse_over) {
                        var percent = (self.settings.delay - delay) / self.settings.delay * 100;
                        self.$ele.data("notify-delay", delay), self.$ele.find('[data-notify="progressbar"] > div').attr("aria-valuenow", percent).css("width", percent + "%")
                    }
                    delay <= -self.settings.timer && (clearInterval(timer), self.close())
                }), self.settings.timer)
            }
        },
        close: function() {
            var self = this,
                posX = parseInt(this.$ele.css(this.settings.placement.from)),
                hasAnimation = !1;
            this.$ele.attr("data-closing", "true").addClass(this.settings.animate.exit), self.reposition(posX), $.isFunction(self.settings.onClose) && self.settings.onClose.call(this.$ele), this.$ele.one(this.animations.start, (function() {
                hasAnimation = !0
            })).one(this.animations.end, (function() {
                $(this).remove(), $.isFunction(self.settings.onClosed) && self.settings.onClosed.call(this)
            })), setTimeout((function() {
                hasAnimation || (self.$ele.remove(), self.settings.onClosed && self.settings.onClosed(self.$ele))
            }), 600)
        },
        reposition: function(posX) {
            var self = this,
                notifies = '[data-notify-position="' + this.settings.placement.from + "-" + this.settings.placement.align + '"]:not([data-closing="true"])',
                $elements = this.$ele.nextAll(notifies);
            !0 === this.settings.newest_on_top && ($elements = this.$ele.prevAll(notifies)), $elements.each((function() {
                $(this).css(self.settings.placement.from, posX), posX = parseInt(posX) + parseInt(self.settings.spacing) + $(this).outerHeight()
            }))
        }
    }), $.notify = function(content, options) {
        var plugin;
        return new Notify(this, content, options).notify
    }, $.notifyDefaults = function(options) {
        return defaults = $.extend(!0, {}, defaults, options)
    }, $.notifyClose = function(selector) {
        void 0 === selector || "all" === selector ? $("[data-notify]").find('[data-notify="dismiss"]').trigger("click") : "success" === selector || "info" === selector || "warning" === selector || "danger" === selector ? $(".alert-" + selector + "[data-notify]").find('[data-notify="dismiss"]').trigger("click") : selector ? $(selector + "[data-notify]").find('[data-notify="dismiss"]').trigger("click") : $('[data-notify-position="' + selector + '"]').find('[data-notify="dismiss"]').trigger("click")
    }, $.notifyCloseExcept = function(selector) {
        "success" === selector || "info" === selector || "warning" === selector || "danger" === selector ? $("[data-notify]").not(".alert-" + selector).find('[data-notify="dismiss"]').trigger("click") : $("[data-notify]").not(selector).find('[data-notify="dismiss"]').trigger("click")
    }
}));