import React, { useState } from 'react';
import './LessonCommon.css';

const tabs = ['Ansible 基础', 'Playbook 编写', 'Role 与 Galaxy', '实战: 批量运维'];

export default function LessonAnsibleAuto() {
  const [active, setActive] = useState(0);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge slate">🐚 module_07 — Ansible 自动化</div>
      <div className="fs-hero">
        <h1>Ansible 自动化：Playbook / Role / Galaxy / 批量运维</h1>
        <p>
          Ansible 是无代理 (Agentless) 的配置管理工具——
          通过 <strong>SSH</strong> 连接目标机器，用 <strong>YAML Playbook</strong> 描述期望状态，
          <strong>Role</strong> 封装可复用组件，<strong>Ansible Galaxy</strong> 共享社区角色。
          它让"基础设施即代码 (IaC)"变得简单而强大。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">🐚 Ansible 深入</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🏗️ Ansible 基础</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#22c55e'}}></span> ansible_basics.txt</div>
                <pre className="fs-code">{`═══ Ansible 架构 ═══

  控制节点 (你的机器)
      │
      ├── Inventory (清单: 管理哪些主机)
      ├── Playbook  (剧本: 做什么操作)
      ├── Modules   (模块: 具体执行单元)
      └── SSH ──→ 目标主机 1
              ──→ 目标主机 2
              ──→ 目标主机 N

  核心特性:
    → 无代理! 只需 SSH + Python
    → 幂等! 多次执行结果一致
    → 声明式! 描述"期望状态"而非"操作步骤"

# ─── 安装 ───
# pip install ansible
# brew install ansible
# apt install ansible

# ─── Inventory (主机清单) ───
# /etc/ansible/hosts 或 inventory.ini:
[webservers]
web1.example.com
web2.example.com ansible_port=2222
192.168.1.10 ansible_user=ubuntu

[dbservers]
db1.example.com ansible_user=postgres
db2.example.com

[production:children]    # 组的组!
webservers
dbservers

[webservers:vars]        # 组变量
http_port=80
max_connections=1000

# ─── 动态 Inventory ───
# ansible-inventory -i aws_ec2.yml --graph
# 从 AWS/GCP/Azure API 动态获取主机列表

# ═══ Ad-hoc 命令 (一次性执行) ═══

# 连通性测试
ansible all -m ping

# 执行命令
ansible webservers -m command -a "uptime"
ansible webservers -m shell -a "free -h | head -3"

# 文件操作
ansible webservers -m copy -a "src=./app.conf dest=/etc/app.conf mode=644"
ansible webservers -m file -a "path=/var/log/app state=directory mode=755"

# 包管理
ansible webservers -m apt -a "name=nginx state=present" --become
ansible webservers -m yum -a "name=httpd state=latest" --become

# 服务管理
ansible webservers -m service -a "name=nginx state=restarted" --become

# 收集信息
ansible webservers -m setup              # 所有 facts
ansible webservers -m setup -a "filter=ansible_memtotal_mb"

# ─── 常用选项 ───
# -i inventory.ini   → 指定 Inventory
# -b / --become      → sudo 提权
# -K                 → 询问 sudo 密码
# -f 10              → 10 并行
# --limit web1       → 只在指定主机执行
# --check            → 干跑 (不实际执行!)
# --diff             → 显示文件变更内容`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📜 Playbook 编写</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#f59e0b'}}></span> playbook.yml</div>
                <pre className="fs-code">{`# ═══ Playbook 基本结构 ═══
---
- name: Configure webservers
  hosts: webservers
  become: true           # sudo
  vars:
    app_port: 8080
    app_user: www-data
    packages:
      - nginx
      - certbot
      - python3-certbot-nginx

  # ─── 前置任务 ───
  pre_tasks:
    - name: Update apt cache
      apt:
        update_cache: true
        cache_valid_time: 3600

  # ─── 主任务 ───
  tasks:
    - name: Install packages
      apt:
        name: "{{ packages }}"
        state: present

    - name: Create app user
      user:
        name: "{{ app_user }}"
        shell: /bin/bash
        create_home: true

    - name: Deploy Nginx config
      template:
        src: templates/nginx.conf.j2
        dest: /etc/nginx/sites-available/default
        mode: '0644'
      notify: Restart Nginx     # 变更时触发 handler!

    - name: Enable site
      file:
        src: /etc/nginx/sites-available/default
        dest: /etc/nginx/sites-enabled/default
        state: link

    - name: Ensure Nginx is running
      service:
        name: nginx
        state: started
        enabled: true

    - name: Open firewall ports
      ufw:
        rule: allow
        port: "{{ item }}"
        proto: tcp
      loop:
        - '80'
        - '443'
        - "{{ app_port }}"

  # ─── 触发器 ───
  handlers:
    - name: Restart Nginx
      service:
        name: nginx
        state: restarted

# ═══ 条件 / 循环 / 注册变量 ═══
  tasks:
    # 条件
    - name: Install on Debian
      apt: name=nginx state=present
      when: ansible_os_family == "Debian"

    - name: Install on RedHat
      yum: name=httpd state=present
      when: ansible_os_family == "RedHat"

    # 注册变量
    - name: Check service status
      command: systemctl is-active nginx
      register: nginx_status
      changed_when: false       # 不标记为 changed
      failed_when: false        # 不标记为 failed

    - name: Start Nginx if not running
      service: name=nginx state=started
      when: nginx_status.rc != 0

    # 循环
    - name: Create multiple users
      user:
        name: "{{ item.name }}"
        groups: "{{ item.groups }}"
        state: present
      loop:
        - { name: alice, groups: admin }
        - { name: bob,   groups: developers }
        - { name: charlie, groups: developers }

    # 错误处理
    - name: Risky operation
      command: /opt/risky-script.sh
      register: result
      ignore_errors: true

    - name: Rollback if failed
      command: /opt/rollback.sh
      when: result.failed

    # block / rescue / always (try-catch-finally!)
    - block:
        - name: Deploy app
          copy: src=app.jar dest=/opt/app/
        - name: Restart app
          service: name=myapp state=restarted
      rescue:
        - name: Rollback
          copy: src=app.jar.bak dest=/opt/app/app.jar
      always:
        - name: Notify
          debug: msg="Deployment attempt completed"`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>📦 Role 与 Galaxy</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#2563eb'}}></span> roles.txt</div>
                <pre className="fs-code">{`═══ Role 目录结构 ═══

# ansible-galaxy init nginx
roles/
└── nginx/
    ├── defaults/
    │   └── main.yml        # 默认变量 (优先级最低, 易覆盖)
    ├── vars/
    │   └── main.yml        # 角色变量 (优先级高)
    ├── tasks/
    │   └── main.yml        # 主任务
    ├── handlers/
    │   └── main.yml        # 触发器
    ├── templates/
    │   └── nginx.conf.j2   # Jinja2 模板
    ├── files/
    │   └── ssl.crt          # 静态文件
    ├── meta/
    │   └── main.yml        # 依赖声明
    └── README.md

═══ Role 实现示例 ═══

# roles/nginx/defaults/main.yml:
---
nginx_port: 80
nginx_worker_processes: auto
nginx_worker_connections: 1024
nginx_server_name: "_"
nginx_root: /var/www/html
nginx_ssl_enabled: false

# roles/nginx/tasks/main.yml:
---
- name: Install Nginx
  apt:
    name: nginx
    state: present
  notify: Restart Nginx

- name: Deploy config
  template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    validate: nginx -t -c %s    # 部署前验证!
  notify: Reload Nginx

- name: Deploy SSL certs
  copy:
    src: "{{ item }}"
    dest: /etc/nginx/ssl/
    mode: '0600'
  loop:
    - ssl.crt
    - ssl.key
  when: nginx_ssl_enabled

- name: Enable and start
  service:
    name: nginx
    state: started
    enabled: true

# roles/nginx/templates/nginx.conf.j2:
worker_processes {{ nginx_worker_processes }};
events {
    worker_connections {{ nginx_worker_connections }};
}
http {
    server {
        listen {{ nginx_port }};
        server_name {{ nginx_server_name }};
        root {{ nginx_root }};
{% if nginx_ssl_enabled %}
        listen 443 ssl;
        ssl_certificate /etc/nginx/ssl/ssl.crt;
        ssl_certificate_key /etc/nginx/ssl/ssl.key;
{% endif %}
    }
}

# roles/nginx/meta/main.yml:
---
dependencies:
  - role: common      # 先执行 common role
  - role: firewall
    vars:
      firewall_ports:
        - 80
        - 443

═══ 使用 Role ═══
# site.yml:
---
- hosts: webservers
  become: true
  roles:
    - common
    - { role: nginx, nginx_port: 8080, nginx_ssl_enabled: true }
    - application

═══ Ansible Galaxy ═══

# 安装社区 Role
ansible-galaxy install geerlingguy.docker
ansible-galaxy install geerlingguy.mysql

# requirements.yml:
---
roles:
  - name: geerlingguy.docker
    version: "6.1.0"
  - name: geerlingguy.nginx
  - src: https://github.com/user/role.git
    name: custom-role
    version: main

collections:
  - name: community.docker
    version: ">=3.0.0"

# 安装所有依赖:
ansible-galaxy install -r requirements.yml`}</pre>
              </div>
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-grid-2">
            <div className="fs-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🚀 实战: 批量运维</h3>
              <div className="fs-code-wrap">
                <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#10b981'}}></span> ops_playbooks.yml</div>
                <pre className="fs-code">{`# ═══ 实战 1: 批量安全更新 ═══
---
- name: Security patch all servers
  hosts: all
  become: true
  serial: "30%"          # 每次更新 30% 的服务器 (滚动!)
  max_fail_percentage: 10 # 超过 10% 失败则停止

  pre_tasks:
    - name: Notify start
      debug: msg="Starting patch on {{ inventory_hostname }}"

  tasks:
    - name: Update all packages
      apt:
        upgrade: safe      # 只安全升级 (不删除)
        update_cache: true
      register: update_result

    - name: Check if reboot required
      stat: path=/var/run/reboot-required
      register: reboot_required

    - name: Reboot if needed
      reboot:
        reboot_timeout: 300
        msg: "Ansible security patch reboot"
      when: reboot_required.stat.exists

    - name: Wait for server
      wait_for_connection:
        delay: 10
        timeout: 300
      when: reboot_required.stat.exists

  post_tasks:
    - name: Verify services
      service_facts:
    - name: Assert Nginx running
      assert:
        that: ansible_facts.services['nginx.service'].state == 'running'
        fail_msg: "Nginx is not running after patch!"
      when: "'webservers' in group_names"

# ═══ 实战 2: 零停机部署 ═══
---
- name: Zero-downtime deployment
  hosts: webservers
  become: true
  serial: 1              # 逐台部署!
  vars:
    app_version: "{{ version | default('latest') }}"
    app_dir: /opt/myapp
    health_url: "http://localhost:8080/health"

  tasks:
    # 1. 从负载均衡摘除
    - name: Remove from LB
      haproxy:
        state: disabled
        host: "{{ inventory_hostname }}"
        backend: app_backend
      delegate_to: "{{ groups['loadbalancer'][0] }}"

    # 2. 等待连接排空
    - name: Wait for connections to drain
      wait_for:
        timeout: 30

    # 3. 部署新版本
    - name: Download artifact
      get_url:
        url: "https://artifacts.example.com/app-{{ app_version }}.jar"
        dest: "{{ app_dir }}/app.jar"
        checksum: "sha256:{{ artifact_checksum }}"

    # 4. 重启服务
    - name: Restart application
      systemd:
        name: myapp
        state: restarted
        daemon_reload: true

    # 5. 健康检查
    - name: Wait for health check
      uri:
        url: "{{ health_url }}"
        status_code: 200
      register: health
      retries: 30
      delay: 5
      until: health.status == 200

    # 6. 加回负载均衡
    - name: Add back to LB
      haproxy:
        state: enabled
        host: "{{ inventory_hostname }}"
        backend: app_backend
      delegate_to: "{{ groups['loadbalancer'][0] }}"

# 使用:
# ansible-playbook deploy.yml -e "version=1.2.3"

# ═══ 实战 3: 服务器初始化 ═══
---
- name: Initialize new server
  hosts: new_servers
  become: true
  roles:
    - role: common     # 基础配置 (时区/NTP/DNS)
    - role: security   # 安全加固 (SSH/firewall/fail2ban)
    - role: monitoring # 监控 (node_exporter/filebeat)
    - role: docker     # Docker 安装
  
  tasks:
    - name: Create deploy user
      user:
        name: deploy
        groups: docker,sudo
        shell: /bin/bash
        
    - name: Set up SSH keys
      authorized_key:
        user: deploy
        key: "{{ lookup('file', '~/.ssh/deploy_key.pub') }}"

    - name: Harden SSH
      lineinfile:
        path: /etc/ssh/sshd_config
        regexp: "{{ item.regexp }}"
        line: "{{ item.line }}"
      loop:
        - { regexp: '^PermitRootLogin', line: 'PermitRootLogin no' }
        - { regexp: '^PasswordAuthentication', line: 'PasswordAuthentication no' }
      notify: Restart SSH`}</pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
