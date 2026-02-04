const Applet = imports.ui.applet;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;

class TwingateApplet extends Applet.TextIconApplet {
    constructor(orientation, panel_height, instance_id) {
        super(orientation, panel_height, instance_id);

        this.set_applet_tooltip("Twingate Status");
        this.menuManager = new PopupMenu.PopupMenuManager(this);
        this.menu = new Applet.AppletPopupMenu(this, orientation);
        this.menuManager.addMenu(this.menu);

        this._buildMenu();
        this._updateStatus();
        this._timeout = Mainloop.timeout_add_seconds(5, () => {
            this._updateStatus();
            return true;
        });
    }

    _buildMenu() {
        this.menu.removeAll();

        this.statusItem = new PopupMenu.PopupMenuItem("Status: Checking...", { reactive: false });
        this.menu.addMenuItem(this.statusItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let startItem = new PopupMenu.PopupMenuItem("Start Twingate");
        startItem.connect('activate', () => {
            GLib.spawn_command_line_async('twingate start');
            Mainloop.timeout_add_seconds(2, () => {
                this._updateStatus();
                return false;
            });
        });
        this.menu.addMenuItem(startItem);

        let stopItem = new PopupMenu.PopupMenuItem("Stop Twingate");
        stopItem.connect('activate', () => {
            GLib.spawn_command_line_async('twingate stop');
            Mainloop.timeout_add_seconds(2, () => {
                this._updateStatus();
                return false;
            });
        });
        this.menu.addMenuItem(stopItem);
    }

    _updateStatus() {
        try {
            let [success, stdout, stderr, exit_status] = GLib.spawn_command_line_sync('twingate status');
            let output = stdout.toString().trim();
            let isOnline = output.toLowerCase().includes('online');

            if (isOnline) {
                this.set_applet_icon_symbolic_name('network-vpn-symbolic');
                this.set_applet_label('Twingate');
                this.statusItem.label.set_text('Status: Online');
                this.actor.style = 'color: #73d216;';
            } else {
                this.set_applet_icon_symbolic_name('network-vpn-disconnected-symbolic');
                this.set_applet_label('Twingate');
                this.statusItem.label.set_text('Status: Offline');
                this.actor.style = 'color: #cc0000;';
            }
        } catch (e) {
            this.set_applet_icon_symbolic_name('network-vpn-acquiring-symbolic');
            this.set_applet_label('Twingate');
            this.statusItem.label.set_text('Status: Unknown');
            this.actor.style = '';
        }
    }

    on_applet_clicked(event) {
        this.menu.toggle();
    }

    on_applet_removed_from_panel() {
        if (this._timeout) {
            Mainloop.source_remove(this._timeout);
        }
    }
}

function main(metadata, orientation, panel_height, instance_id) {
    return new TwingateApplet(orientation, panel_height, instance_id);
}
