<?php

namespace Superadmin\Entity;

use DateTime;
use Doctrine\ORM\Mapping as ORM;
use User\Entity\User;
use Superadmin\Entity\Applications;
use Superadmin\Entity\Groups;

/**
 * @ORM\Entity(repositoryClass="Superadmin\Repository\GroupsLinkApplicationsRepository")
 * @ORM\Table(name="groups_link_applications")
 */
class GroupsLinkApplications
{

    /** 
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity="Superadmin\Entity\Groups")
     * @ORM\JoinColumn(name="group_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     * @var Groups
     */
    private $group;

    /**
     * @ORM\ManyToOne(targetEntity="Superadmin\Entity\Applications")
     * @ORM\JoinColumn(name="application_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     * @var Applications
     */
    private $application;

    /**
     * @ORM\Column(name="date_begin", type="datetime", nullable=true)
     * @var \DateTime
     */
    private $dateBegin = null;

    /**
     * @ORM\Column(name="date_end", type="datetime", nullable=true)
     * @var \DateTime
     */
    private $dateEnd = null;


    /**
     * @return Int
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * @return Groups
     */
    public function getGroup()
    {
        return $this->group;
    }

    /**
     * @param User $user
     * @return GroupsLinkApplications
     */
    public function setGroup(Groups $group): self
    {
        $this->group = $group;
        return $this;
    }

    /**
     * @return Applications
     */
    public function getApplication()
    {
        return $this->application;
    }

    /**
     * @param Applications
     * @return GroupsLinkApplications
     */
    public function setApplication(Applications $application): self
    {
        $this->application = $application;
        return $this;
    }


    /**
     * @return \DateTime
     */
    public function getDateBegin(): ?\DateTime
    {
        return $this->dateBegin;
    }

    /**
     * @param \DateTime $dateBegin
     * @return GroupsLinkApplications
     */
    public function setDateBegin(\DateTime $dateBegin): self
    {
        $this->dateBegin = $dateBegin;
        return $this;
        //throw new EntityDataIntegrityException("dateBegin needs to be DateTime or null");
    }

    /**
     * @return \DateTime
     */
    public function getDateEnd(): ?\DateTime
    {
        return $this->dateEnd;
    }

    /**
     * @param \DateTime $dateEnd
     * @return GroupsLinkApplications
     */
    public function setDateEnd(\DateTime $dateEnd)
    {
        $this->dateEnd = $dateEnd;
        return $this;
        /* if ($dateEnd instanceof \DateTime || $dateEnd == "")
            $this->dateEnd = $dateEnd;
        else
            throw new EntityDataIntegrityException("dateEnd needs to be DateTime or null"); */
    }

    public function jsonSerialize()
    {
        return [
            'id' => $this->getId(),
            'group_id' => $this->getGroup(),
            'application_id' => $this->getApplication(),
            'date_begin' => $this->getDateBegin(),
            'date_end' => $this->getDateEnd()
        ];
    }

    public static function jsonDeserialize($jsonDecoded)
    {
        $classInstance = new self();
        foreach ($jsonDecoded as $attributeName => $attributeValue) {
            $classInstance->{$attributeName} = $attributeValue;
        }
        return $classInstance;
    }
}
